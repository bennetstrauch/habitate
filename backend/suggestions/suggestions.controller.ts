import { RequestHandler } from "express";
import { ActivitySuggestionModel, UserModel } from "../database/schemas";
import { StandardResponse } from "../types/standardResponse";
import { ErrorWithStatus } from "../utils/error.class";
import { requireFriendship } from "../utils/friendship";
import { ActivitySuggestion, MAX_SUGGESTION_LENGTH } from "./suggestions.types";
import { idToObjectId } from "../utils/functionsAndVariables";
import moment from "moment-timezone";
import { sendPushToUser } from "../utils/push";

export const postSuggestion: RequestHandler<
  unknown,
  StandardResponse<ActivitySuggestion>,
  { to_user_id: string; date: string; text: string; goal_id?: string }
> = async (req, res, next) => {
  try {
    const { to_user_id, date, text, goal_id } = req.body;

    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);
    if (!text?.trim()) throw new ErrorWithStatus("Text is required", 400);
    if (text.length > MAX_SUGGESTION_LENGTH)
      throw new ErrorWithStatus(
        `Suggestion must be ${MAX_SUGGESTION_LENGTH} characters or fewer`,
        400
      );

    await requireFriendship(req.userId, to_user_id);

    const sender = await UserModel.findById(req.userId, "name");
    if (!sender) throw new ErrorWithStatus("User not found", 404);

    const dayDate = moment.utc(date, "YYYY-MM-DD").startOf("day").toDate();

    try {
      const suggestion = await ActivitySuggestionModel.create({
        from_user_id: idToObjectId(req.userId),
        from_user_name: sender.name,
        to_user_id: idToObjectId(to_user_id),
        date: dayDate,
        text: text.trim(),
        goal_id: goal_id ? idToObjectId(goal_id) : null,
      });

      res
        .status(201)
        .json({ success: true, data: suggestion as unknown as ActivitySuggestion });

      sendPushToUser(to_user_id, `✨ ${sender.name} suggested an activity`, text.trim()).catch(() => {});
    } catch (err: any) {
      if (err.code === 11000)
        throw new ErrorWithStatus(
          "You already suggested an activity for this person today",
          409
        );
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

export const getSuggestions: RequestHandler<
  unknown,
  StandardResponse<ActivitySuggestion[]>,
  unknown,
  { date: string; forUserId?: string }
> = async (req, res, next) => {
  try {
    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);

    const { date, forUserId } = req.query;
    const startOfDay = moment.utc(date, "YYYY-MM-DD").startOf("day").toDate();
    const endOfDay = moment.utc(date, "YYYY-MM-DD").endOf("day").toDate();

    const dateFilter = {
      $or: [
        { display_date: { $gte: startOfDay, $lte: endOfDay } },
        { display_date: null, date: { $gte: startOfDay, $lte: endOfDay } },
      ],
    };

    if (forUserId) {
      await requireFriendship(req.userId, forUserId);
      const suggestions = await ActivitySuggestionModel.find({
        to_user_id: idToObjectId(forUserId),
        ...dateFilter,
        status: "accepted",
      });
      res.json({ success: true, data: suggestions as unknown as ActivitySuggestion[] });
      return;
    }

    const suggestions = await ActivitySuggestionModel.find({
      to_user_id: idToObjectId(req.userId),
      ...dateFilter,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: suggestions as unknown as ActivitySuggestion[] });
  } catch (err) {
    next(err);
  }
};

export const putSuggestion: RequestHandler<
  { id: string },
  StandardResponse<ActivitySuggestion>,
  { status?: string; completed?: boolean; goal_id?: string | null; display_date?: string | null }
> = async (req, res, next) => {
  try {
    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);

    const suggestion = await ActivitySuggestionModel.findById(req.params.id);
    if (!suggestion) throw new ErrorWithStatus("Suggestion not found", 404);
    if (suggestion.to_user_id.toString() !== req.userId)
      throw new ErrorWithStatus("Not authorized", 403);

    const { status, completed, goal_id, display_date } = req.body;
    if (status) (suggestion as any).status = status;
    if (completed !== undefined) (suggestion as any).completed = completed;
    if (goal_id !== undefined)
      (suggestion as any).goal_id = goal_id ? idToObjectId(goal_id) : null;
    if (display_date !== undefined)
      (suggestion as any).display_date = display_date
        ? moment.utc(display_date, "YYYY-MM-DD").startOf("day").toDate()
        : null;

    await suggestion.save();
    res.json({ success: true, data: suggestion as unknown as ActivitySuggestion });
  } catch (err) {
    next(err);
  }
};

export const getSent: RequestHandler<
  unknown,
  StandardResponse<ActivitySuggestion | null>,
  unknown,
  { to_user_id: string; date: string }
> = async (req, res, next) => {
  try {
    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);

    const { to_user_id, date } = req.query;
    const startOfDay = moment.utc(date, "YYYY-MM-DD").startOf("day").toDate();
    const endOfDay = moment.utc(date, "YYYY-MM-DD").endOf("day").toDate();

    const suggestion = await ActivitySuggestionModel.findOne({
      from_user_id: idToObjectId(req.userId),
      to_user_id: idToObjectId(to_user_id),
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({
      success: true,
      data: suggestion as unknown as ActivitySuggestion | null,
    });
  } catch (err) {
    next(err);
  }
};
