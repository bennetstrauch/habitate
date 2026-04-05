import { RequestHandler } from "express";
import { ActivitySuggestionModel, SuggestionReplyModel, UserModel } from "../database/schemas";
import { StandardResponse } from "../types/standardResponse";
import { ErrorWithStatus } from "../utils/error.class";
import { idToObjectId } from "../utils/functionsAndVariables";
import { sendPushToUser } from "../utils/push";
import { MAX_REPLY_LENGTH, SuggestionReply } from "./suggestion-replies.types";

export const postReply: RequestHandler<
  unknown,
  StandardResponse<SuggestionReply>,
  { suggestion_id: string; text: string }
> = async (req, res, next) => {
  try {
    const { suggestion_id, text } = req.body;

    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);
    if (!text?.trim()) throw new ErrorWithStatus("Reply text is required", 400);
    if (text.length > MAX_REPLY_LENGTH)
      throw new ErrorWithStatus(`Reply must be ${MAX_REPLY_LENGTH} characters or fewer`, 400);

    const suggestion = await ActivitySuggestionModel.findById(suggestion_id);
    if (!suggestion) throw new ErrorWithStatus("Suggestion not found", 404);
    if (suggestion.to_user_id.toString() !== req.userId)
      throw new ErrorWithStatus("Not authorized to reply to this suggestion", 403);

    const sender = await UserModel.findById(req.userId, "name");
    if (!sender) throw new ErrorWithStatus("User not found", 404);

    const uplifterUserId = suggestion.from_user_id.toString();

    const reply = await SuggestionReplyModel.create({
      suggestion_id: idToObjectId(suggestion_id),
      from_user_id: idToObjectId(req.userId),
      from_user_name: sender.name,
      to_user_id: suggestion.from_user_id,
      suggestion_text: suggestion.text,
      text: text.trim(),
    });

    res.status(201).json({ success: true, data: reply as unknown as SuggestionReply });

    sendPushToUser(uplifterUserId, `💬 ${sender.name}`, suggestion.text).catch(() => {});
  } catch (err) {
    next(err);
  }
};

export const getUnseenReplies: RequestHandler<
  unknown,
  StandardResponse<SuggestionReply[]>
> = async (req, res, next) => {
  try {
    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);

    const replies = await SuggestionReplyModel.find({
      to_user_id: idToObjectId(req.userId),
      seen: false,
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: replies as unknown as SuggestionReply[] });
  } catch (err) {
    next(err);
  }
};

export const markRepliesSeen: RequestHandler<
  unknown,
  StandardResponse<null>,
  { ids: string[] }
> = async (req, res, next) => {
  try {
    if (!req.userId) throw new ErrorWithStatus("Unauthorized", 401);
    const { ids } = req.body;

    await SuggestionReplyModel.updateMany(
      { _id: { $in: ids.map(idToObjectId) }, to_user_id: idToObjectId(req.userId) },
      { $set: { seen: true } }
    );

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
