import { Router } from "express";
import { getUnseenReplies, markRepliesSeen, postReply } from "./suggestion-replies.controller";

export const suggestionRepliesRouter = Router();

suggestionRepliesRouter.get("/unseen", getUnseenReplies);
suggestionRepliesRouter.post("/", postReply);
suggestionRepliesRouter.patch("/mark-seen", markRepliesSeen);
