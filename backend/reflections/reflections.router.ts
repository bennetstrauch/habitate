import { Router } from "express";
import { getReflectionForDate, putReflection } from "./reflections.controller";

const router = Router();

router.get("/", getReflectionForDate);
router.put("/:reflection_id", putReflection);
// router.post("/", postGoal);

export const reflectionsRouter = router;
