import { Router } from "express";
import { deleteComment, getCommentCountsForFriends, getComments, getUnseenDates, markCommentsSeen, postComment } from "./comments.controller";

const router = Router();

router.post("/", postComment);
router.patch("/mark-seen", markCommentsSeen);
router.get("/counts", getCommentCountsForFriends);
router.get("/unseen-dates", getUnseenDates);
router.get("/", getComments);
router.delete("/:id", deleteComment);

export const commentsRouter = router;
