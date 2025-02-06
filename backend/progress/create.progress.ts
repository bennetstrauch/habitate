import { getGoalsDB } from "../goals/goals.controller";
import { Goal, GoalModel } from "../goals/goals.model";
import { getNewProgressForToday } from "../utils/functionsAndVariables";
import {
  HabitProgress,
  HabitProgressBase,
  HabitProgressModel,
} from "./progress.model";

// create habit.latestProgress when creating new Habit !!! #####
// readme
// readme

export async function createDailyHabitProgress(goals: Goal[]) {
  const newProgresses: HabitProgress[] = [];

  for (const goal of goals) {
    for (const habit of goal.habits) {
      const newProgress = getNewProgressForToday(habit._id);

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
