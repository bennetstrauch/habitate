import mongoose from "mongoose";
import { HabitProgress, HabitProgressBase } from "../progress/progress.model";

export const getDateOnly = (): string => dateWithoutTime(new Date());

export const dateWithoutTime = (date: Date): string =>
  date.toISOString().split("T")[0];

export const getNewProgressForToday = (habit_id: string): HabitProgress => {
  return {
    _id: generateObjectIdAsString(), //#check type later on
    habit_id: habit_id,

    date: new Date(),
    completed: false,
    attempted: false,
  } as HabitProgress;
};

export const generateObjectIdAsString = (): string =>
  new mongoose.Types.ObjectId().toString();
