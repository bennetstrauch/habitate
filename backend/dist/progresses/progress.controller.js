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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgressStats = exports.putProgress = exports.createBatchProgresses = exports.createProgress = exports.getProgresses = exports.getProgress = exports.toggleProgress = void 0;
const error_class_1 = require("../utils/error.class");
const toggleValues_progress_1 = require("./toggleValues.progress");
const schemas_1 = require("../database/schemas");
const functionsAndVariables_1 = require("../utils/functionsAndVariables");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const newProgress_1 = require("./newProgress");
// remove#
const toggleProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { habitId, date } = req.params;
    try {
        const updatedProgress = yield (0, toggleValues_progress_1.toggleCompleted)(habitId, date);
        if (!updatedProgress) {
            throw new error_class_1.ErrorWithStatus("Progress not found", 404);
        }
        res.json({ success: true, data: updatedProgress });
    }
    catch (err) {
        next(err);
    }
});
exports.toggleProgress = toggleProgress;
const getProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { progress_id } = req.params;
        const progress = (yield schemas_1.HabitProgressModel.findOne({ progress_id }, { embedded_name: 0, __v: 0 }));
        if (!progress) {
            throw new error_class_1.ErrorWithStatus("getProgressError: Progress not found", 404);
        }
        res.json({ success: true, data: progress });
    }
    catch (err) {
        next(err);
    }
});
exports.getProgress = getProgress;
const getProgresses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getProgresses called with: ", req.query);
        const { date, habit_ids } = req.query;
        const startOfDay = moment_timezone_1.default.utc(date, "YYYY-MM-DD").startOf("day").toDate();
        const endOfDay = moment_timezone_1.default.utc(date, "YYYY-MM-DD").endOf("day").toDate();
        console.log("Querying progresses between:", startOfDay, "and", endOfDay);
        console.log("Converted habit IDs:", (0, functionsAndVariables_1.idsToArrayOfObjectIds)(habit_ids));
        const progresses = (yield schemas_1.HabitProgressModel.find(
        // change date to Datetype
        {
            habit_id: { $in: (0, functionsAndVariables_1.idsToArrayOfObjectIds)(habit_ids) },
            date: { $gte: startOfDay, $lte: endOfDay },
        }, { embedded_name: 0, __v: 0 }));
        if (!progresses) {
            throw new error_class_1.ErrorWithStatus("No Progress not found", 404);
        }
        res.json({ success: true, data: progresses });
    }
    catch (err) {
        next(err);
    }
});
exports.getProgresses = getProgresses;
const createProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, habit_id } = req.body;
        const createdProgress = yield (0, newProgress_1.createAndSaveProgressForDate)(habit_id, new Date(date));
        console.log("createdProgress", createdProgress);
        res.json({ success: true, data: createdProgress });
    }
    catch (err) {
        next(err);
    }
});
exports.createProgress = createProgress;
const createBatchProgresses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, habit_ids } = req.body;
        const dateObj = new Date(date);
        const progressesToInsert = habit_ids.map((habit_id) => (0, newProgress_1.getNewProgressForDate)(habit_id, dateObj));
        const createdProgresses = yield schemas_1.HabitProgressModel.insertMany(progressesToInsert);
        res.json({ success: true, data: createdProgresses });
    }
    catch (err) {
        next(err);
    }
});
exports.createBatchProgresses = createBatchProgresses;
const putProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { progress_id } = req.params;
        const result = yield schemas_1.HabitProgressModel.updateOne({ _id: progress_id }, { $set: req.body });
        res.status(200).json({ success: true, data: result.modifiedCount });
    }
    catch (err) {
        next(err);
    }
});
exports.putProgress = putProgress;
const getProgressStatsForDateRange = (habit_ids, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("habit_ids", habit_ids, "startDate", startDate, "endDate", endDate);
    const progressStats = yield schemas_1.HabitProgressModel.aggregate([
        {
            $match: {
                // do i have to convert habit_ids to ObjectIds? ##
                habit_id: {
                    $in: habit_ids,
                    // $in: habit_ids.map((id) => new mongoose.Types.ObjectId(id)),
                },
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: "$habit_id",
                total: { $sum: 1 }, //  ## don't need total any more I guess.
                completed: { $sum: { $cond: ["$completed", 1, 0] } }, // Count only completed ones
            },
        },
    ]);
    return progressStats;
});
const getProgressStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { period, offset, date, habit_ids } = req.query;
        const { startDate, endDate } = (0, functionsAndVariables_1.calculateStartAndEndDate)(period, offset, date);
        console.log("getProgressStats called with: ", "date", date, "startDate", startDate, "endDate", endDate, "newDate", new Date());
        const progressStats = yield getProgressStatsForDateRange((0, functionsAndVariables_1.idsToArrayOfObjectIds)(habit_ids), startDate, endDate);
        //##extra method
        const data = {
            progressStats,
            startDate: startDate.toDateString().split("T")[0],
            endDate: endDate.toDateString().split("T")[0],
        };
        res.json({ success: true, data: data });
    }
    catch (err) {
        next(err);
    }
});
exports.getProgressStats = getProgressStats;
