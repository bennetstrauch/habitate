import { Router } from "express";
import { getReflectionForDate, getReflectionStats, putReflection } from "./reflections.controller";

const router = Router();

router.get("/", getReflectionForDate);
router.put("/:reflection_id", putReflection);

router.get("/stats", getReflectionStats)

export const reflectionsRouter = router;
