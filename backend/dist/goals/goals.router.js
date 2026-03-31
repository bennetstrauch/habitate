"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalsRouter = void 0;
const express_1 = require("express");
const goals_controller_1 = require("./goals.controller");
const habits_controller_1 = require("./habits.controller");
const progress_controller_1 = require("../progresses/progress.controller");
const router = (0, express_1.Router)();
//## standardize
router.get("/", goals_controller_1.getGoals);
router.post("/", goals_controller_1.postGoal);
router.get("/:goal_id", goals_controller_1.getGoal);
router.put("/:goal_id", goals_controller_1.putGoal);
router.delete("/:goal_id", goals_controller_1.deleteGoal);
// # extra Router
router.get("/:goal_id/habits", habits_controller_1.getHabits);
router.post("/:goal_id/habits", habits_controller_1.addHabit);
router.post("/:goal_id/habits/help", habits_controller_1.addHabitHelp);
router.delete("/:goal_id/habits/:habit_id", habits_controller_1.deleteHabit);
// # maybe the id and date in queryparams instead of body? is this one used? ## clear up
router.get("/:goal_id/habits/progresses/:date", progress_controller_1.getProgresses);
router.get("/:goal_id/habits/:habit_id/progresses/:date/:progress_id", progress_controller_1.getProgresses); // i could redirect that to one down?
// router.get("/progresses/:progress_id", getProgresses); #this one is correctly in the progress router
exports.goalsRouter = router;
