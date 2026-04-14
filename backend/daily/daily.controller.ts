import { RequestHandler } from "express";
import { StandardResponse } from "../types/standardResponse";
import { DailyViewData, Goal } from "../goals/goals.types";
import { HabitProgress } from "../progresses/progress.types";
import { GoalModel, HabitProgressModel, UserModel } from "../database/schemas";
import { requireFriendship } from "../utils/friendship";
import { getNewProgressForDate } from "../progresses/newProgress";
import { getDateForTimezone } from "../utils/functionsAndVariables";
import moment from "moment-timezone";

export const getDaily: RequestHandler<
  unknown,
  StandardResponse<DailyViewData>
> = async (req, res, next) => {
  const { timezone = "UTC", forUserId } = req.query as { timezone?: string; forUserId?: string };

  try {
    let targetUserId: string;
    let todayDate: Date;

    if (forUserId) {
      targetUserId = await requireFriendship(req.userId, forUserId);
      const friend = await UserModel.findById(targetUserId, { timezone: 1 }).lean();
      todayDate = getDateForTimezone(friend?.timezone ?? "UTC");
    } else {
      targetUserId = req.userId!;
      todayDate = getDateForTimezone(timezone);
      await UserModel.updateOne(
        { _id: req.userId, timezone: { $ne: timezone } },
        { $set: { timezone } }
      );
    }

    const goals = await GoalModel.find(
      { createdByUserWithId: targetUserId },
      { embedded_name: 0, __v: 0 }
    ).lean() as unknown as Goal[];

    if (goals.length === 0) {
      return res.json({ success: true, data: { goals: [], progresses: [] } });
    }

    const allHabits = goals.flatMap(g => g.habits);
    const startOfDay = moment(todayDate).startOf("day").toDate();
    const endOfDay = moment(todayDate).endOf("day").toDate();

    const existing = await HabitProgressModel.find({
      habit_id: { $in: allHabits.map(h => h._id) },
      date: { $gte: startOfDay, $lte: endOfDay },
    }).lean() as unknown as HabitProgress[];

    const existingIds = new Set(existing.map(p => p.habit_id.toString()));
    const missingHabits = allHabits.filter(h => !existingIds.has((h._id as any).toString()));

    let progresses = [...existing];

    if (missingHabits.length > 0) {
      const newRecords = missingHabits.map(h => getNewProgressForDate(h._id as any, todayDate));
      const created = await HabitProgressModel.insertMany(newRecords) as unknown as HabitProgress[];
      progresses = [...existing, ...created];
    }

    res.json({ success: true, data: { goals, progresses } });
  } catch (err) {
    next(err);
  }
};
