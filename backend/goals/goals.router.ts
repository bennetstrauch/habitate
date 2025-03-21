import { Router } from "express";
import {
  deleteGoal,
  getGoal,
  getGoals,
  postGoal,
  putGoal,
} from "./goals.controller";
import {
  addHabit,
  addHabitHelp,
  deleteHabit,
  getHabits,
} from "./habits.controller";
import { getProgresses } from "../progresses/progress.controller";

const router = Router();

//## standardize
router.get("/", getGoals);
router.post("/", postGoal);

router.get("/:goal_id", getGoal);
router.put("/:goal_id", putGoal);
router.delete("/:goal_id", deleteGoal);

// # extra Router
router.get("/:goal_id/habits", getHabits);
router.post("/:goal_id/habits", addHabit);
router.post("/:goal_id/habits/help", addHabitHelp);
router.delete("/:goal_id/habits/:habit_id", deleteHabit);

// # maybe the id and date in queryparams instead of body? is this one used? ## clear up
router.get("/:goal_id/habits/progresses/:date", getProgresses);

router.get(
  "/:goal_id/habits/:habit_id/progresses/:date/:progress_id",
  getProgresses
); // i could redirect that to one down?
// router.get("/progresses/:progress_id", getProgresses); #this one is correctly in the progress router
export const goalsRouter = router;
