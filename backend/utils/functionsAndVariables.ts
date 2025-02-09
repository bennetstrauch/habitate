import mongoose from "mongoose";
import { HabitProgress, HabitProgressBase } from "../progress/progress.types";
import { DateTime } from "luxon";

export const getDateOnly = (timezone: string): string => {
  return DateTime.now().setZone(timezone).toISODate() || "";
};

export const dateWithoutTime = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const dateToLuxonWithoutTime = (date: Date): DateTime => {
  return DateTime.fromJSDate(date).startOf("day");
};

export const getLocalLuxonDate = (timezone: string): DateTime =>
  DateTime.now().setZone("America/Chicago").startOf("day");

export const getNewProgressForToday = (
  habit_id: string,
  timezone: string
): HabitProgress => {

  return {
    _id: generateObjectIdAsString(), //#check type later on
    habit_id: habit_id,

    date: getLocalLuxonDate(timezone).toJSDate(),
    completed: false,
    attempted: false,
  } as HabitProgress;
};

export const generateObjectIdAsString = (): string =>
  new mongoose.Types.ObjectId().toString();
