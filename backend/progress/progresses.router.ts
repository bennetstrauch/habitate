import { Router } from "express";
import { getProgress, putProgress } from "./progress.controller";


const router = Router();

//## standardize
router.get("/:progress_id", getProgress);
router.put("/:progress_id", putProgress);

export const progressRouter = router;

