import { RequestHandler } from "express";
import { CommentModel, UserModel } from "../database/schemas";
import { StandardResponse } from "../types/standardResponse";
import { ErrorWithStatus } from "../utils/error.class";
import { requireFriendship } from "../utils/friendship";
import { Comment, MAX_COMMENT_LENGTH } from "./comments.types";
import { idToObjectId } from "../utils/functionsAndVariables";
import moment from "moment-timezone";
import { sendPushToUser } from "../utils/push";

export const postComment: RequestHandler<
  unknown,
  StandardResponse<Comment>,
  { to_user_id: string; habit_id: string; habit_name: string; date: string; text: string }
> = async (req, res, next) => {
  try {
    const { to_user_id, habit_id, habit_name, date, text } = req.body;

    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);
    if (!text?.trim()) throw new ErrorWithStatus("Comment text is required", 400);
    if (text.length > MAX_COMMENT_LENGTH)
      throw new ErrorWithStatus(`Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`, 400);

    await requireFriendship(req.userId, to_user_id);

    const startOfDay = moment.utc(date, "YYYY-MM-DD").startOf("day").toDate();
    const endOfDay = moment.utc(date, "YYYY-MM-DD").endOf("day").toDate();
    const existingCount = await CommentModel.countDocuments({
      from_user_id: idToObjectId(req.userId),
      to_user_id: idToObjectId(to_user_id),
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    if (existingCount >= 2) throw new ErrorWithStatus("You can only send 2 comments per friend per day", 400);

    const sender = await UserModel.findById(req.userId, "name");
    if (!sender) throw new ErrorWithStatus("User not found", 404);

    const comment = await CommentModel.create({
      from_user_id: idToObjectId(req.userId),
      from_user_name: sender.name,
      to_user_id: idToObjectId(to_user_id),
      habit_id: idToObjectId(habit_id),
      habit_name,
      date: moment.utc(date, "YYYY-MM-DD").startOf("day").toDate(),
      text: text.trim(),
    });

    res.status(201).json({ success: true, data: comment as unknown as Comment });

    sendPushToUser(to_user_id, `💬 ${sender.name}`, comment.habit_name).catch(() => {});
  } catch (err) {
    next(err);
  }
};

export const getComments: RequestHandler<
  unknown,
  StandardResponse<Comment[]>,
  unknown,
  { date: string }
> = async (req, res, next) => {
  try {
    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);

    const { date } = req.query;
    const startOfDay = moment.utc(date, "YYYY-MM-DD").startOf("day").toDate();
    const endOfDay = moment.utc(date, "YYYY-MM-DD").endOf("day").toDate();

    const comments = await CommentModel.find({
      to_user_id: idToObjectId(req.userId),
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ _id: -1 });

    res.json({ success: true, data: comments as unknown as Comment[] });
  } catch (err) {
    next(err);
  }
};

export const deleteComment: RequestHandler<
  { id: string },
  StandardResponse<null>
> = async (req, res, next) => {
  try {
    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);

    const comment = await CommentModel.findById(req.params.id);
    if (!comment) throw new ErrorWithStatus("Comment not found", 404);

    if (comment.to_user_id.toString() !== req.userId)
      throw new ErrorWithStatus("Not authorized to delete this comment", 403);

    await CommentModel.deleteOne({ _id: req.params.id });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

export const markCommentsSeen: RequestHandler<
  unknown,
  StandardResponse<null>,
  { ids: string[] }
> = async (req, res, next) => {
  try {
    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);
    const { ids } = req.body;
    await CommentModel.updateMany(
      { _id: { $in: ids.map(idToObjectId) }, to_user_id: idToObjectId(req.userId) },
      { $set: { seen: true } }
    );
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

export const getUnseenDates: RequestHandler<
  unknown,
  StandardResponse<string[]>
> = async (req, res, next) => {
  try {
    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);
    const sevenDaysAgo = moment.utc().subtract(7, "days").startOf("day").toDate();
    const unseenComments = await CommentModel.find(
      { to_user_id: idToObjectId(req.userId), seen: { $ne: true }, date: { $gte: sevenDaysAgo } },
      { date: 1 }
    );
    const dates = [...new Set(unseenComments.map((c) => moment.utc(c.date).format("YYYY-MM-DD")))];
    res.json({ success: true, data: dates });
  } catch (err) {
    next(err);
  }
};

export const getCommentCountsForFriends: RequestHandler<
  unknown,
  StandardResponse<Record<string, number>>,
  unknown,
  { date: string; friend_ids: string }
> = async (req, res, next) => {
  try {
    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);

    const { date, friend_ids } = req.query;
    const ids = friend_ids.split(",").map((id) => idToObjectId(id));

    const startOfDay = moment.utc(date, "YYYY-MM-DD").startOf("day").toDate();
    const endOfDay = moment.utc(date, "YYYY-MM-DD").endOf("day").toDate();

    const counts = await CommentModel.aggregate([
      {
        $match: {
          from_user_id: idToObjectId(req.userId),
          to_user_id: { $in: ids },
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $group: { _id: "$to_user_id", count: { $sum: 1 } } },
    ]);

    const result: Record<string, number> = {};
    counts.forEach((c) => { result[c._id.toString()] = c.count; });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
