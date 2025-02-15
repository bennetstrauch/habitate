import mongoose  from "mongoose";
import { HabitProgress } from "../progress/progress.types";
import { DateTime } from "luxon";
import { ObjectId } from "../types/ObjectId.type";



export const idsToArrayOfObjectIds = (ids: string) : ObjectId[] => {
  return ids.split(",").map((id) => new mongoose.Types.ObjectId(id));
}  


export const getDateOnly = (timezone: string): string => {
  return DateTime.now().setZone(timezone).toISODate() || "";
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
