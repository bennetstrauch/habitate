import mongoose from "mongoose";
import { HabitProgress } from "../progresses/progress.types";
import { DateTime } from "luxon";
import { ObjectId } from "../types/ObjectId.type";
import moment from "moment-timezone";
import path from "path";

export const appNameForSendingEmails = `"Habitate" <${process.env.EMAIL_FROM}>`;

export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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
  return moment.tz(timezone).startOf("day").toDate();
};

// type DateString = `${number}-${number}-${number}`;
// ##could be used

//## move to date.utils take out period in type
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

export function getRandomElement<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}


export function getRandomPhrase(options: string[]): string {
  return getRandomElement<string>(options);
}

// ## logo path is different between dev (one ../ less) and production.
const logoPath = path.join(__dirname, "../../../global/assets/habitatelogo_64.png");

export const logoAttachmentForEmail = {
        filename: "logo.png",
        path: logoPath,
        cid: "habitateLogo",
      }
