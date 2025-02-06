import { HabitProgress, HabitProgressModel } from "./progress.model";

export async function toggleCompleted(habitId: string, date: string): Promise<HabitProgress | null> {

    const updatedProgress = await HabitProgressModel.findOneAndUpdate(
      { habitId, date },
      [
        {
          $set: {
            completed: { $not: "$completed" },
            attempted: { $cond: [{ $not: "$completed" }, true, "$attempted"] },
          },
        },
      ],
      { new: true }
    ) as HabitProgress | null;


  return updatedProgress;
}
  