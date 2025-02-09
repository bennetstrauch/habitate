import { RequestHandler } from "express";
import { ErrorWithStatus } from "../utils/classes";
import { HabitProgress } from "./progress.types";
import { StandardResponse } from "../types/standardResponse";
import { toggleCompleted } from "./toggleValues.progress";
import { HabitProgressModel } from "../database/schemas";

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
      throw new ErrorWithStatus("Progress not found", 404);
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
