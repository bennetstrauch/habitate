import { HabitProgress } from "./progress.types";
import { generateObjectIdAsString } from "../utils/generateObjectId";
import { HabitProgressModel } from "backend/database/schemas";

export const getNewProgressForDate = (
  habit_id: string,
  date: Date
): HabitProgress => {
  return {
    _id: generateObjectIdAsString(), //#check type later on
    habit_id: habit_id,

    date: date,
    completed: false,
    attempted: false,
  } as HabitProgress;
};

export const createAndSaveNewProgressForDate = async (
  habit_id: string,
  date: Date
): Promise<HabitProgress> => {
  //
  const newProgress = getNewProgressForDate(habit_id, date);
  return await HabitProgressModel.create(newProgress);
};
