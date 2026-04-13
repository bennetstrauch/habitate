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
  pushSubscriptions: PushSubscription[];
}

function buildTimeWindowMatch(timeField: string) {
  return {
    $and: [
      {
        $gte: [
          timeField,
          {
            $dateToString: {
              date: { $subtract: [new Date(), 14 * 60 * 1000] },
              timezone: "$timezone",
              format: "%H:%M",
            },
          },
        ],
      },
      {
        $lte: [
          timeField,
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
  };
}

function buildReflectionNotDoneToday() {
  return {
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
  };
}

cron.schedule("00,15,27,30,45 * * * *", async () => {
  console.log("Running reflection reminder job at: ", new Date());

  // Primary reminder
  const primaryMatches = await UserModel.aggregate<ReminderDetails>([
    {
      $match: {
        $or: [
          { "reflectionDetails.enableEmail": true },
          { "reflectionDetails.enablePush": true },
        ],
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            buildTimeWindowMatch("$reflectionDetails.reflectionReminderTime"),
            buildReflectionNotDoneToday(),
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
        latestReflectionDate: "$reflectionDetails.latestReflectionDate",
        enableEmail: "$reflectionDetails.enableEmail",
        enablePush: "$reflectionDetails.enablePush",
        pushSubscriptions: "$reflectionDetails.pushSubscriptions",
      },
    },
  ]);

  for (const details of primaryMatches) {
    if (details.enableEmail) await sendEmailReminder(details);
    if (details.enablePush) await sendPushReminder(details);
  }

  // Second reminder
  const secondMatches = await UserModel.aggregate<ReminderDetails>([
    {
      $match: {
        $or: [
          { "reflectionDetails.enablePush": true },
          { "reflectionDetails.secondReminderEnableEmail": true },
        ],
        "reflectionDetails.secondReminderTime": { $exists: true, $ne: null },
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            buildTimeWindowMatch("$reflectionDetails.secondReminderTime"),
            buildReflectionNotDoneToday(),
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
        reflectionReminderTime: "$reflectionDetails.secondReminderTime",
        latestReflectionDate: "$reflectionDetails.latestReflectionDate",
        enableEmail: "$reflectionDetails.secondReminderEnableEmail",
        enablePush: "$reflectionDetails.enablePush",
        pushSubscriptions: "$reflectionDetails.pushSubscriptions",
      },
    },
  ]);

  for (const details of secondMatches) {
    if (details.enableEmail) await sendEmailReminder(details);
    if (details.enablePush) await sendPushReminder(details);
  }
});