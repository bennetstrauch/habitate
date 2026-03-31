"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHabitHelp = exports.deleteHabit = exports.addHabit = exports.getHabits = void 0;
const error_class_1 = require("../utils/error.class");
const aiHelp_1 = require("./ai/aiHelp");
const goals_controller_1 = require("./goals.controller");
const schemas_1 = require("../database/schemas");
const newProgress_1 = require("../progresses/newProgress");
const generateObjectId_1 = require("../utils/generateObjectId");
const date_utils_shared_1 = require("../utils/date.utils.shared");
// ## two times getHabit functionality used here, abstract
const getHabits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { goal_id } = req.params;
        const goal = yield (0, goals_controller_1.findOneGoalHelper)(goal_id, req.userId);
        if (!goal) {
            throw new error_class_1.ErrorWithStatus("Goal not found", 404);
        }
        res.json({ success: true, data: goal.habits });
    }
    catch (err) {
        next(err);
    }
});
exports.getHabits = getHabits;
const addHabit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { goal_id } = req.params;
        const { habit, date } = req.body;
        console.log("habit", habit, "date", date);
        habit._id = (0, generateObjectId_1.generateObjectIdAsString)();
        const progress = yield (0, newProgress_1.createAndSaveProgressForDate)(habit._id, (0, date_utils_shared_1.dateOnlyStringToUTCDate)(date));
        habit.latestProgress = progress;
        const result = yield schemas_1.GoalModel.updateOne({ _id: goal_id, createdByUserWithId: req.userId }, { $push: { habits: habit } });
        res.status(200).json({ success: true, data: result.modifiedCount });
    }
    catch (err) {
        next(err);
    }
});
exports.addHabit = addHabit;
const deleteHabit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { goal_id, habit_id } = req.params;
        const result = yield schemas_1.GoalModel.updateOne({ _id: goal_id, createdByUserWithId: req.userId }, { $pull: { habits: { _id: habit_id } } });
        res.status(200).json({ success: true, data: result.modifiedCount });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteHabit = deleteHabit;
const addHabitHelp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { goal_id } = req.params;
        // const goal = await findOneGoalHelper(goal_id);
        // if (!goal) {
        //     throw new ErrorWithStatus('Goal not found', 404);
        // }
        const response = yield (0, aiHelp_1.handleAddHabitHelp)(goal_id);
    }
    catch (err) {
        next(err);
    }
});
exports.addHabitHelp = addHabitHelp;
