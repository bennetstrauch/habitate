import { Router } from "express";
import { getReflectionForDate, getReflectionStats, getReflectionsForRange, putReflection } from "./reflections.controller";

const router = Router();

router.get("/", getReflectionForDate);
router.get("/stats", getReflectionStats);
router.get("/range", getReflectionsForRange);
router.put("/:reflection_id", putReflection);

export const reflectionsRouter = router;
