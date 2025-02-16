import { RequestHandler } from "express";
import { ErrorWithStatus } from "../utils/classes";
import { HabitProgress, ProgressStat } from "./progress.types";
import { StandardResponse } from "../types/standardResponse";
import { toggleCompleted } from "./toggleValues.progress";
import { HabitProgressModel } from "../database/schemas";
import {
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  subWeeks,
} from "date-fns";
import { idsToArrayOfObjectIds } from "../utils/functionsAndVariables";
import { ObjectId } from "../types/ObjectId.type";
import moment from "moment-timezone";

type ToggleProgressReqHandler = RequestHandler<
  { habitId: string; date: string },
  StandardResponse<HabitProgress>
>;

export const toggleProgress: ToggleProgressReqHandler = async (
  req,
  res,
  next
) => {
  const { habitId, date } = req.params;

  try {
    const updatedProgress = await toggleCompleted(habitId, date);

    if (!updatedProgress) {
      throw new ErrorWithStatus("Progress not found", 404);
    }

    res.json({ success: true, data: updatedProgress });
  } catch (err) {
    next(err);
  }
};

type GetProgressReqHandler = RequestHandler<
  { progress_id: string },
  StandardResponse<HabitProgress | null>
>;

export const getProgress: GetProgressReqHandler = async (req, res, next) => {
  try {
    const { progress_id } = req.params;

    const progress = (await HabitProgressModel.findOne(
      { progress_id },
      { embedded_name: 0, __v: 0 }
    )) as HabitProgress | null;

    if (!progress) {
      throw new ErrorWithStatus("getProgressError: Progress not found", 404);
    }

    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};

// ## edit chatgpt suggestions, needed?
type GetProgressesReqHandler = RequestHandler<
  { date: string },
  StandardResponse<HabitProgress[] | null>,
  { habit_ids: string[] }
>;

export const getProgresses: GetProgressesReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const { date } = req.params;
    const { habit_ids } = req.body;

    const progresses = (await HabitProgressModel.find(
      { habit_id: { $in: habit_ids }, date },
      { embedded_name: 0, __v: 0 }
    )) as HabitProgress[] | null;

    if (!progresses) {
      throw new ErrorWithStatus("No Progress not found", 404);
    }

    res.json({ success: true, data: progresses });
  } catch (err) {
    next(err);
  }
};

type PutProgressReqHandler = RequestHandler<
  { progress_id: string },
  StandardResponse<number>,
  HabitProgress
>;

export const putProgress: PutProgressReqHandler = async (req, res, next) => {
  try {
    const { progress_id } = req.params;

    const result = await HabitProgressModel.updateOne(
      { _id: progress_id },
      { $set: req.body }
    );

    res.status(200).json({ success: true, data: result.modifiedCount });
  } catch (err) {
    next(err);
  }
};

const getProgressStatsForDateRange = async (
  habit_ids: ObjectId[],
  startDate: Date,
  endDate: Date
) => {
  console.log(
    "habit_ids",
    habit_ids,
    "startDate",
    startDate,
    "endDate",
    endDate
  );

  const progressStats = await HabitProgressModel.aggregate([
    {
      $match: {
        // do i have to convert habit_ids to ObjectIds? ##
        habit_id: {
          $in: habit_ids,
          // $in: habit_ids.map((id) => new mongoose.Types.ObjectId(id)),
        },
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$habit_id",
        total: { $sum: 1 }, // Count all progress records
        completed: { $sum: { $cond: ["$completed", 1, 0] } }, // Count only completed ones
      },
    },
  ]);

  return progressStats as ProgressStat[];
};

type GetProgressStatsReqHandler = RequestHandler<
  undefined,
  StandardResponse<ProgressStat[]>,
  undefined,
  {
    period: "week" | "month";
    offset: string;
    timezone: string;
    habit_ids: string;
  }
>;

export const getProgressStats: GetProgressStatsReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const { period, offset, timezone, habit_ids } = req.query; // "week" or "month"

    let startDate: Date;
    let endDate: Date;

    if (period === "month") {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    } else {
      const offsetAsInt = parseInt(offset as string) || 0;
      // sendTimezone to get the correct date!###

      const startMoment = moment().tz(timezone).subtract(offsetAsInt, "weeks");

      startDate = startMoment.startOf("isoWeek").toDate(); // isoWeek starts on Monday

      endDate = startMoment.endOf("isoWeek").endOf("day").toDate(); // Ends on Sunday
    }

    console.log(
      "getProgressStats called with: ",
      "timezone",
      timezone,
      "startDate",
      startDate,
      "endDate",
      endDate,
      "newDate",
      new Date()
    );

    const progressStats = await getProgressStatsForDateRange(
      idsToArrayOfObjectIds(habit_ids),
      startDate,
      endDate
    );

    res.json({ success: true, data: progressStats });
  } catch (err) {
    next(err);
  }
};
