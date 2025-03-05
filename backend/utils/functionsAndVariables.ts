import mongoose from "mongoose";
import { HabitProgress } from "../progresses/progress.types";
import { DateTime } from "luxon";
import { ObjectId } from "../types/ObjectId.type";
import moment from "moment-timezone";

export const idsToArrayOfObjectIds = (ids: string): ObjectId[] => {
  return ids.split(",").map((id) => idToObjectId(id));
};

export const idToObjectId = (id: string): ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

export const getDateOnlyForTimeZone = (timezone: string) => {
  return moment.tz(timezone).format("YYYY-MM-DD");
};

//## rmv this and luxon dependency, and we could unify those two.
export const getDateForTimezone = (timezone: string): Date => {
  return moment.tz(timezone).startOf('day').toDate();
};

// type DateString = `${number}-${number}-${number}`;
// ##could be used

//# take out period in type
export const calculateStartAndEndDate = (
  period: "week" | "month",
  offset: string,
  date: string
) => {
  let startDate: Date;
  let endDate: Date;

  const offsetAsInt = parseInt(offset as string) || 0;

  const startMoment = moment.utc(date, "YYYY-MM-DD").add(offsetAsInt, period);

  const periodForMoment: "isoWeek" | "month" =
    period === "week" ? "isoWeek" : period;

  startDate = startMoment.startOf(periodForMoment).toDate(); // isoWeek starts on Monday
  endDate = startMoment.endOf(periodForMoment).endOf("day").toDate();

  return { startDate, endDate };
};
