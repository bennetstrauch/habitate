import { Router } from "express";
import {
  createProgress,
  getProgress,
  getProgresses,
  getProgressStats,
  putProgress,
} from "./progress.controller";

const router = Router();

//## standardize
router.get("", getProgresses);
router.post("", createProgress)

router.get("/stats", getProgressStats);

router.get("/:progress_id", getProgress);
router.put("/:progress_id", putProgress);

export const progressRouter = router;
