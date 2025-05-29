import { RequestHandler } from "express";
import { ErrorWithStatus } from "../utils/error.class";
import {
  HabitProgress,
  ProgressStat,
  ProgressStatsForDateRange,
} from "./progress.types";
import { StandardResponse } from "../types/standardResponse";
import { toggleCompleted } from "./toggleValues.progress";
import { HabitProgressModel } from "../database/schemas";

import {
  calculateStartAndEndDate,
  idsToArrayOfObjectIds,
} from "../utils/functionsAndVariables";
import { ObjectId } from "../types/ObjectId.type";
import moment from "moment-timezone";
import { createAndSaveProgressForDate, getNewProgressForDate } from "./newProgress";

type ToggleProgressReqHandler = RequestHandler<
  { habitId: string; date: string },
  StandardResponse<HabitProgress>
>;
// remove#
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
  unknown,
  StandardResponse<HabitProgress[] | null>,
  unknown,
  { date: string; habit_ids: string }
>;

export const getProgresses: GetProgressesReqHandler = async (
  req,
  res,
  next
) => {
  try {
    console.log("getProgresses called with: ", req.query);

    const { date, habit_ids } = req.query;

    const startOfDay = moment.utc(date, "YYYY-MM-DD").startOf("day").toDate();
    const endOfDay = moment.utc(date, "YYYY-MM-DD").endOf("day").toDate();

    console.log("Querying progresses between:", startOfDay, "and", endOfDay);

    console.log("Converted habit IDs:", idsToArrayOfObjectIds(habit_ids));

    const progresses = (await HabitProgressModel.find(
      // change date to Datetype
      {
        habit_id: { $in: idsToArrayOfObjectIds(habit_ids) },
        date: { $gte: startOfDay, $lte: endOfDay },
      },
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

type CreateProgressReqHandler = RequestHandler<
  unknown,
  StandardResponse<HabitProgress>,
  { date: string; habit_id: string }
>;

export const createProgress: CreateProgressReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const { date, habit_id } = req.body;

    const createdProgress = await createAndSaveProgressForDate(
      habit_id,
      new Date(date)
    );
    console.log("createdProgress", createdProgress);

    res.json({ success: true, data: createdProgress });
  } catch (err) {
    next(err);
  }
};


type CreateBatchProgressReqHandler = RequestHandler<
  unknown,
  StandardResponse<HabitProgress[]>,
  { date: string; habit_ids: string[] }
>;

export const createBatchProgresses: CreateBatchProgressReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const { date, habit_ids } = req.body;

    const dateObj = new Date(date);

    const progressesToInsert = habit_ids.map((habit_id) =>
      getNewProgressForDate(habit_id, dateObj)
    );

    const createdProgresses = await HabitProgressModel.insertMany(progressesToInsert);

    res.json({ success: true, data: createdProgresses });
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
        total: { $sum: 1 }, //  ## don't need total any more I guess.
        completed: { $sum: { $cond: ["$completed", 1, 0] } }, // Count only completed ones
      },
    },
  ]);

  return progressStats as ProgressStat[];
};

//## already map the states here instead of in fe and change type as well?
type GetProgressStatsReqHandler = RequestHandler<
  undefined,
  StandardResponse<ProgressStatsForDateRange>,
  undefined,
  {
    period: "week" | "month";
    offset: string;
    date: string;
    habit_ids: string;
  }
>;

export const getProgressStats: GetProgressStatsReqHandler = async (
  req,
  res,
  next
) => {
  try {
    const { period, offset, date, habit_ids } = req.query;

    const { startDate, endDate } = calculateStartAndEndDate(
      period,
      offset,
      date
    );

    console.log(
      "getProgressStats called with: ",
      "date",
      date,
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

    //##extra method
    const data = {
      progressStats,
      startDate: startDate.toDateString().split("T")[0],
      endDate: endDate.toDateString().split("T")[0],
    };

    res.json({ success: true, data: data });
  } catch (err) {
    next(err);
  }
};
