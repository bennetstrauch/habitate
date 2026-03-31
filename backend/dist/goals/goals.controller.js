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
exports.findOneGoalHelper = exports.deleteGoal = exports.putGoal = exports.postGoal = exports.getGoal = exports.getGoalsDB = exports.getGoals = void 0;
const error_class_1 = require("../utils/error.class");
const embedding_1 = require("./ai/embedding");
const queries_1 = require("../database/queries");
const schemas_1 = require("../database/schemas");
const friendship_1 = require("../utils/friendship");
// #refactor
const getGoals = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { timezone = "UTC", forUserId } = req.query;
    try {
        const targetUserId = forUserId
            ? yield (0, friendship_1.requireFriendship)(req.userId, forUserId)
            : req.userId;
        const userGoals = yield (0, exports.getGoalsDB)(targetUserId);
        res.json({ success: true, data: userGoals });
        if (!forUserId) {
            const updateTimezoneResult = yield schemas_1.UserModel.updateOne({ _id: req.userId, timezone: { $ne: timezone } }, { $set: { timezone: timezone } });
            console.log("usersNewTimezone", timezone, "updatedCount:", updateTimezoneResult.modifiedCount);
        }
    }
    catch (err) {
        next(err);
    }
});
exports.getGoals = getGoals;
const getGoalsDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // # how to check if createProgress needs to be triggered? frontend is responsible
    // # , update: boolean)
    const results = yield schemas_1.GoalModel.find({ createdByUserWithId: userId }, { embedded_name: 0, __v: 0 }).populate({
        path: "habits.latestProgress",
        select: "-__v",
    });
    // # get progresses here and attach to goal? -might take longer?
    return results;
});
exports.getGoalsDB = getGoalsDB;
const getGoal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { goal_id } = req.params;
        const goal = yield (0, exports.findOneGoalHelper)(goal_id, req.userId);
        if (!goal) {
            throw new error_class_1.ErrorWithStatus("Goal not found", 404);
        }
        res.json({ success: true, data: goal });
    }
    catch (err) {
        next(err);
    }
});
exports.getGoal = getGoal;
const postGoal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goalBase = req.body;
        if (!goalBase.name) {
            throw new error_class_1.ErrorWithStatus("Goal name is required", 400);
        }
        let embedded_name = undefined;
        let ranking = -1; // default ranking##
        try {
            embedded_name = yield (0, embedding_1.generateEmbedding)(goalBase.name);
            ranking = (yield (0, queries_1.findSimilarGoals)(embedded_name)) + 1;
            console.log("ranking", ranking);
        }
        catch (err) {
            console.error("Error generating embedding:", err);
            throw new error_class_1.ErrorWithStatus("Failed to generate embedding", 500);
        }
        const result = yield schemas_1.GoalModel.create(Object.assign(Object.assign({}, goalBase), { embedded_name, createdByUserWithId: req.userId, ranking }));
        const goalObject = result.toObject();
        delete goalObject.embedded_name;
        res.json({ success: true, data: goalObject });
    }
    catch (err) {
        next(err);
    }
});
exports.postGoal = postGoal;
const putGoal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { goal_id } = req.params;
        const result = yield schemas_1.GoalModel.updateOne({ _id: goal_id, createdByUserWithId: req.userId }, { $set: req.body });
        res.status(200).json({ success: true, data: result.modifiedCount });
    }
    catch (err) {
        next(err);
    }
});
exports.putGoal = putGoal;
const deleteGoal = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { goal_id } = req.params;
        const result = yield schemas_1.GoalModel.deleteOne({
            _id: goal_id,
            createdByUserWithId: req.userId,
        });
        res.status(200).json({ success: true, data: result.deletedCount });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteGoal = deleteGoal;
// ## use in all getGoal / getHabit methods
const findOneGoalHelper = (goal_id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { _id: goal_id };
    if (userId) {
        query.createdByUserWithId = userId;
    }
    return (yield schemas_1.GoalModel.findOne(query, {
        embedded_name: 0,
        __v: 0,
    }));
});
exports.findOneGoalHelper = findOneGoalHelper;
