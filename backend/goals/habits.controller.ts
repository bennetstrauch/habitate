import { RequestHandler } from "express";
import { Habit } from "./goals.types";
import { StandardResponse } from "../types/standardResponse";
import { ErrorWithStatus } from "../utils/classes";
import { handleAddHabitHelp } from "./ai/aiHelp";
import { findOneGoalHelper } from "./goals.controller";
import {
  generateObjectIdAsString,
  getNewProgressForToday,
} from "../utils/functionsAndVariables";
import { GoalModel, HabitProgressModel } from "../database/schemas";

type GetHabbitsReqHandler = RequestHandler<
  { goal_id: string },
  StandardResponse<Habit[]>
>;

// ## two times getHabit functionality used here, abstract
export const getHabits: GetHabbitsReqHandler = async (req, res, next) => {
  try {
    const { goal_id } = req.params;
    const goal = await findOneGoalHelper(goal_id, req.userId);

    if (!goal) {
      throw new ErrorWithStatus("Goal not found", 404);
    }

    res.json({ success: true, data: goal.habits });
  } catch (err) {
    next(err);
  }
};

export const addHabit: RequestHandler<
  { goal_id: string },
  StandardResponse<number>,
  { habit: Habit; timezone: string }
  // ## correct fe request
> = async (req, res, next) => {
  try {
    const { goal_id } = req.params;
    const { habit, timezone } = req.body;
    habit._id = generateObjectIdAsString();

    const newProgress = getNewProgressForToday(habit._id, timezone);
    const progress = await HabitProgressModel.create(newProgress);

    habit.latestProgress = progress;

    const result = await GoalModel.updateOne(
      { _id: goal_id, createdByUserWithId: req.userId },
      { $push: { habits: habit } }
    );

    res.status(200).json({ success: true, data: result.modifiedCount });
  } catch (err) {
    next(err);
  }
};

export const deleteHabit: RequestHandler<
  { goal_id: string; habit_id: string },
  StandardResponse<number>
> = async (req, res, next) => {
  try {
    const { goal_id, habit_id } = req.params;

    const result = await GoalModel.updateOne(
      { _id: goal_id, createdByUserWithId: req.userId },
      { $pull: { habits: { _id: habit_id } } }
    );

    res.status(200).json({ success: true, data: result.modifiedCount });
  } catch (err) {
    next(err);
  }
};

export const addHabitHelp: RequestHandler<
  { goal_id: string },
  StandardResponse<number>
> = async (req, res, next) => {
  try {
    const { goal_id } = req.params;
    // const goal = await findOneGoalHelper(goal_id);

    // if (!goal) {
    //     throw new ErrorWithStatus('Goal not found', 404);
    // }

    const response = await handleAddHabitHelp(goal_id);
  } catch (err) {
    next(err);
  }
};
