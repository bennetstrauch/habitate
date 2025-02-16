import mongoose from "mongoose";
import { HabitProgress } from "../progress/progress.types";
import { DateTime } from "luxon";
import { ObjectId } from "../types/ObjectId.type";
import moment from "moment-timezone";

export const idsToArrayOfObjectIds = (ids: string): ObjectId[] => {
  return ids.split(",").map((id) => new mongoose.Types.ObjectId(id));
};

export const getDateOnlyForTimeZone = (timezone: string) => {
  return moment.tz(timezone).format("YYYY-MM-DD");
};

//## rmv this and luxon dependency, and we could unify those two.
export const getDateForTimezone = (timezone: string): Date => {
  return moment.tz(timezone).toDate();
};

export const getNewProgressForToday = (
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

export const generateObjectIdAsString = (): string =>
  new mongoose.Types.ObjectId().toString();
