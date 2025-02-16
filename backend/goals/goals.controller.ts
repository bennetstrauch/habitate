import { Goal, GoalBase } from "./goals.types";
import { RequestHandler } from "express";
import { ErrorWithStatus } from "../utils/classes";
import { StandardResponse } from "../types/standardResponse";
import { generateEmbedding } from "./ai/embedding";
import { findSimilarGoals } from "../database/queries";
import { getDateOnlyForTimeZone } from "../utils/functionsAndVariables";
import { createDailyHabitProgressForGoals } from "../progress/create.progress.cron";
import { GoalModel, UserModel } from "../database/schemas";

type GetGoalsReqHandler = RequestHandler<
  { createNewProgressesForToday?: boolean },
  StandardResponse<Goal[]>
>;

export const getGoals: GetGoalsReqHandler = async (req, res, next) => {
  const { timezone = "UTC" } = req.query as { timezone?: string };

  try {

    let results: Goal[] = await getGoalsDB(req.userId);

    //#do wee need await, I guess not?
    const result = await UserModel.updateOne(
      { _id: req.userId, timezone: { $ne: timezone } }, 
      { $set: { timezone: timezone } }
    );

    console.log("timezone", timezone, 'updating timezone', result.modifiedCount);

    


    // #cleaner, needed if cron-job? not really??? ###
    for (const goal of results) {
      if (goal.habits.length !== 0) {
        // # if no progress for today, create, for test
        // if(goal.habits[0].latestProgress === null) {
        //   results = await createDailyHabitProgress(results, timezone);
        //   break;
        // }
        const latestProgressDate = goal.habits[0].latestProgress.date
          .toISOString()
          .split("T")[0];
        const localDate = getDateOnlyForTimeZone(timezone);

        console.log(
          "latestProgressDate",
          latestProgressDate,
          "localDate",
          localDate
        );
        console.log(
          "latestProgressDate < localDate",
          latestProgressDate < localDate
        );

        if (latestProgressDate < localDate) {
          results = await createDailyHabitProgressForGoals(
            results,
            new Date(localDate)
          );
        }
        break;
      }
    }

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

export const getGoalsDB = async (userId: string | undefined) => {
  // # how to check if createProgress needs to be triggered? frontend is responsible
  // # , update: boolean)

  const results: Goal[] = await GoalModel.find(
    { createdByUserWithId: userId },
    { embedded_name: 0, __v: 0 }
  ).populate({
    path: "habits.latestProgress",
    select: "-__v",
  });

  // # get progresses here and attach to goal? -might take longer?

  return results;
};

type GetGoalReqHandler = RequestHandler<
  { goal_id: string },
  StandardResponse<Goal | null>
>;

export const getGoal: GetGoalReqHandler = async (req, res, next) => {
  try {
    const { goal_id } = req.params;

    const goal = await findOneGoalHelper(goal_id, req.userId);

    if (!goal) {
      throw new ErrorWithStatus("Goal not found", 404);
    }

    res.json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

export const postGoal: RequestHandler<
  unknown,
  StandardResponse<Goal>,
  GoalBase
> = async (req, res, next) => {
  try {
    const goalBase = req.body;
    const embedded_name = await generateEmbedding(goalBase.name);

    const ranking = await findSimilarGoals(embedded_name);
    console.log("ranking", ranking);

    const result = await GoalModel.create({
      ...goalBase,
      embedded_name,
      createdByUserWithId: req.userId,
      ranking,
    });

    res.json({ success: true, data: result as Goal });
  } catch (err) {
    next(err);
  }
};

type PutGoalReqHandler = RequestHandler<
  { goal_id: string },
  StandardResponse<number>,
  GoalBase
>;

export const putGoal: PutGoalReqHandler = async (req, res, next) => {
  try {
    const { goal_id } = req.params;
    const result = await GoalModel.updateOne(
      { _id: goal_id, createdByUserWithId: req.userId },
      { $set: req.body }
    );

    res.status(200).json({ success: true, data: result.modifiedCount });
  } catch (err) {
    next(err);
  }
};

export const deleteGoal: RequestHandler<
  { goal_id: string },
  StandardResponse<number>
> = async (req, res, next) => {
  try {
    const { goal_id } = req.params;

    const result = await GoalModel.deleteOne({
      _id: goal_id,
      createdByUserWithId: req.userId,
    });

    res.status(200).json({ success: true, data: result.deletedCount });
  } catch (err) {
    next(err);
  }
};

// ## use in all getGoal / getHabit methods
export const findOneGoalHelper = async (goal_id: string, userId?: string) => {
  const query: { _id: string; createdByUserWithId?: string } = { _id: goal_id };

  if (userId) {
    query.createdByUserWithId = userId;
  }

  return (await GoalModel.findOne(query, {
    embedded_name: 0,
    __v: 0,
  })) as Goal | null;
};
