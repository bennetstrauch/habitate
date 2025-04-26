import cron from "node-cron";
import { DateTime } from "luxon";
import { sendEmailReminder } from "./email.reminder";
import { sendPushReminder } from "./push.reminder";
import { UserModel } from "../../database/schemas";
import { ObjectId } from "mongoose";
import { PushSubscription } from "web-push";

export interface ReminderDetails {
  user_id: ObjectId;
  username: string;
  email: string;
  timezone: string;
  reflectionReminderTime: string;
  latestReflectionDate: Date | null;
  enableEmail: boolean;
  enablePush: boolean;
  pushSubscription: PushSubscription;
}

cron.schedule("00,07,15,30,45 * * * *", async () => {
  console.log("Running reflection reminder job at: ", new Date());
  const nowUTC = DateTime.utc();
  const reminderDetailsForMatchingUsers =
    await UserModel.aggregate<ReminderDetails>([
      // First stage: Filter users with enableEmail or enablePush
      {
        $match: {
          $or: [
            { "reflectionDetails.enableEmail": true },
            { "reflectionDetails.enablePush": true },
          ],
        },
      },
      // Second stage: Check reflectionReminderTime and latestReflectionDate
      {
        $match: {
          $expr: {
            $and: [
              // Condition 1: reflectionReminderTime within 15 minutes before to equal current time
              {
                $and: [
                  {
                    $gte: [
                      "$reflectionDetails.reflectionReminderTime",
                      {
                        $dateToString: {
                          date: { $subtract: [new Date(), 15 * 60 * 1000] }, // 15 minutes ago
                          timezone: "$timezone",
                          format: "%H:%M",
                        },
                      },
                    ],
                  },
                  {
                    $lte: [
                      "$reflectionDetails.reflectionReminderTime",
                      {
                        $dateToString: {
                          date: new Date(),
                          timezone: "$timezone",
                          format: "%H:%M",
                        },
                      },
                    ],
                  },
                ],
              },
              // Condition 2: latestReflectionDate < today's date in user's timezone
              {
                $and: [
                  { $ne: ["$reflectionDetails.latestReflectionDate", null] },
                  {
                    $lt: [
                      "$reflectionDetails.latestReflectionDate",
                      {
                        $dateFromString: {
                          dateString: {
                            $dateToString: {
                              date: new Date(),
                              timezone: "$timezone",
                              format: "%Y-%m-%d",
                            },
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          user_id: "$_id",
          _id: 0,
          username: "$name",
          email: 1,
          timezone: 1,
          reflectionReminderTime: "$reflectionDetails.reflectionReminderTime",
          enableEmail: "$reflectionDetails.enableEmail",
          enablePush: "$reflectionDetails.enablePush",
          pushSubscription: "$reflectionDetails.pushSubscription",
        },
      },
    ]);

  console.log(
    "Reminder details for matching users:",
    reminderDetailsForMatchingUsers
  );

  for (const reminderDetails of reminderDetailsForMatchingUsers) {
    if (reminderDetails.enableEmail) await sendEmailReminder(reminderDetails);
    if (reminderDetails.enablePush) await sendPushReminder(reminderDetails);
  }
});