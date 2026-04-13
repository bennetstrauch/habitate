import { Goal, GoalBase } from "./goals.types";
import { RequestHandler } from "express";
import { ErrorWithStatus } from "../utils/error.class";
import { StandardResponse } from "../types/standardResponse";
import { generateEmbedding } from "./ai/embedding";
import { findSimilarGoals } from "../database/queries";
import { getDateOnlyForTimeZone, getDateForTimezone } from "../utils/functionsAndVariables";
import { GoalModel, HabitProgressModel, UserModel } from "../database/schemas";
import { requireFriendship } from "../utils/friendship";
import { getNewProgressForDate } from "../progresses/newProgress";
import moment from "moment-timezone";

type GetGoalsReqHandler = RequestHandler<
  { createNewProgressesForToday?: boolean },
  StandardResponse<Goal[]>
>;

export const getGoals: GetGoalsReqHandler = async (req, res, next) => {
  const { timezone = "UTC", forUserId } = req.query as { timezone?: string; forUserId?: string };

  try {
    const targetUserId = forUserId
      ? await requireFriendship(req.userId, forUserId)
      : req.userId;

    if (forUserId) {
      const friend = await UserModel.findById(targetUserId, { timezone: 1 }).lean();
      const todayForFriend = getDateForTimezone(friend?.timezone ?? "UTC");
      const userGoals = await getGoalsWithTodayProgress(targetUserId, todayForFriend);
      res.json({ success: true, data: userGoals });
    } else {
      const userGoals = await getGoalsDB(targetUserId);
      res.json({ success: true, data: userGoals });
      await UserModel.updateOne(
        { _id: req.userId, timezone: { $ne: timezone } },
        { $set: { timezone } }
      );
    }
  } catch (err) {
    next(err);
  }
};

export const getGoalsDB = async (userId: string | undefined): Promise<Goal[]> => {
  return GoalModel.find(
    { createdByUserWithId: userId },
    { embedded_name: 0, __v: 0 }
  );
};

async function getGoalsWithTodayProgress(userId: string, date: Date): Promise<Goal[]> {
  const goals = await GoalModel.find(
    { createdByUserWithId: userId },
    { embedded_name: 0, __v: 0 }
  ).lean() as unknown as Goal[];

  const allHabits = goals.flatMap(g => g.habits);
  if (allHabits.length === 0) return goals;

  const startOfDay = moment(date).startOf("day").toDate();
  const endOfDay = moment(date).endOf("day").toDate();

  const existing = await HabitProgressModel.find({
    habit_id: { $in: allHabits.map(h => h._id) },
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  const progressByHabitId = new Map(existing.map(p => [p.habit_id.toString(), p]));

  const missingHabits = allHabits.filter(h => !progressByHabitId.has((h._id as any).toString()));
  if (missingHabits.length > 0) {
    const newProgresses = missingHabits.map(h => getNewProgressForDate(h._id as any, date));
    const created = await HabitProgressModel.insertMany(newProgresses);
    created.forEach(p => progressByHabitId.set(p.habit_id.toString(), p));
  }

  for (const goal of goals) {
    for (const habit of goal.habits) {
      habit.latestProgress = progressByHabitId.get((habit._id as any).toString()) as any;
    }
  }

  return goals;
}

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
  
      if (!goalBase.name) {
        throw new ErrorWithStatus("Goal name is required", 400);
      }

      let embedded_name = undefined;
      let ranking = -1; // default ranking##

      try {
    const embeddingInput = goalBase.description?.trim()
      ? `${goalBase.name}: ${goalBase.description}`
      : goalBase.name;
    embedded_name = await generateEmbedding(embeddingInput);

    ranking = (await findSimilarGoals(embedded_name)) + 1;
    console.log("ranking", ranking);

  }
  catch (err) {
    console.error("Error generating embedding:", err);
    throw new ErrorWithStatus("Failed to generate embedding", 500);
  }

    const result = await GoalModel.create({
      ...goalBase,
      embedded_name,
      createdByUserWithId: req.userId,
      ranking,
    })
  

    const goalObject = result.toObject();
    delete goalObject.embedded_name;

    res.json({ success: true, data: goalObject as Goal });
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
