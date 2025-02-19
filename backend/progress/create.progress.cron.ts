import cron from "node-cron";
import moment from "moment-timezone";
import { GoalModel, HabitProgressModel, UserModel } from "../database/schemas";
import { Goal } from "../goals/goals.types";
import { getNewProgressForDate as getNewProgressForDate } from "../utils/functionsAndVariables";
import { HabitProgress } from "./progress.types";
//

function getTimeZonesStartingNewDay() {
  const now = moment.utc();
  const timeZones = moment.tz.names();

  return timeZones.filter((tz) => {
    const zoneTime = now.clone().tz(tz);
    return zoneTime.hours() === 0;
  });
}

// Runs every hour, on the hour
// # should we check for existing progress and only create if not existing?
cron.schedule("0 * * * *", async () => {
  console.log("Running create progress cron job at: ", new Date());

  const timeZones = getTimeZonesStartingNewDay();

  const date = moment.tz(timeZones[0]).startOf("day").toDate();

  // Returns distinc user ids whose timezone is in the timezonesStrartingNewDay array:
  const userIds = (await UserModel.distinct("_id", {
    timezone: { $in: timeZones },
  })) as String[];

  if (userIds.length > 0) {
    console.log(
      "Creating progress for users: ",
      userIds,
      "and timeZones: ",
      timeZones,
      "at date: ",
      date
    );
    await createHabitProgressesForUserIds(userIds, date);
  }
});

export async function createHabitProgressesForUserIds(
  userIds: String[],
  date: Date
) {
  for (const userId of userIds) {
    const goals = await GoalModel.find(
      { createdByUserWithId: userId },
      { habits: 1 }
    );

    await createDailyHabitProgressForGoals(goals, date);
  }
}

export async function createDailyHabitProgressForGoals(
  goals: Goal[],
  date: Date
) {
  const newProgresses: HabitProgress[] = [];

  //# ask chatgpt for cleaner code
  for (const goal of goals) {
    for (const habit of goal.habits) {
      const newProgress = getNewProgressForDate(habit._id, date);

      habit.latestProgress = newProgress; // ## could getDate once for all if opt. needed
      newProgresses.push(newProgress);
    }
  }

  if (newProgresses.length !== 0) {
    await HabitProgressModel.insertMany(newProgresses);

    // ## if performance is an issue, not awaiting will be faster
    const result = await GoalModel.bulkWrite(
      goals.map((goal) => ({
        updateOne: {
          filter: { _id: goal._id },
          update: { $set: { habits: goal.habits } },
        },
      }))
    );
  }

  return goals;
}
