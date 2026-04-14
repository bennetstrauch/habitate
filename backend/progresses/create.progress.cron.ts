import { GoalModel, HabitProgressModel } from "../database/schemas";
import { Goal } from "../goals/goals.types";
import { getNewProgressForDate } from "./newProgress";
import { createAndSaveReflectionForDate } from "../reflections/newReflection";

export async function createDailyReflectionForUserIds(userIds: string[], date: Date) {
  for (const userId of userIds) {
    const reflection = await createAndSaveReflectionForDate(userId, date);
  }
}


export async function createHabitProgressesForUserIds(
  userIds: string[],
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
  const newProgresses = goals
    .flatMap(g => g.habits)
    .map(h => getNewProgressForDate(h._id, date));

  if (newProgresses.length > 0) {
    await HabitProgressModel.insertMany(newProgresses);
  }

  return goals;
}
