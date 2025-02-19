import mongoose from "mongoose";
import { HabitProgress } from "../progress/progress.types";
import { DateTime } from "luxon";
import { ObjectId } from "../types/ObjectId.type";
import moment from "moment-timezone";

export const idsToArrayOfObjectIds = (ids: string): ObjectId[] => {
  return ids.split(",").map((id) => idToObjectId(id));
};

export const idToObjectId = (id: string): ObjectId => {
  return new mongoose.Types.ObjectId(id);
}

export const getDateOnlyForTimeZone = (timezone: string) => {
  return moment.tz(timezone).format("YYYY-MM-DD");
};

//## rmv this and luxon dependency, and we could unify those two.
export const getDateForTimezone = (timezone: string): Date => {
  return moment.tz(timezone).toDate();
};




