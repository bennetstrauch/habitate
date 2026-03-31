import { Router } from "express";
import { deleteComment, getCommentCountsForFriends, getComments, postComment } from "./comments.controller";

const router = Router();

router.post("/", postComment);
router.get("/counts", getCommentCountsForFriends);
router.get("/", getComments);
router.delete("/:id", deleteComment);

export const commentsRouter = router;
