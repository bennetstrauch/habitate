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
exports.getReflectionStats = exports.putReflection = exports.createReflection = exports.getReflection = exports.getReflectionForDate = void 0;
const newReflection_1 = require("./newReflection");
const error_class_1 = require("../utils/error.class");
const schemas_1 = require("../database/schemas");
const reflection_database_1 = require("./reflection.database");
const functionsAndVariables_1 = require("../utils/functionsAndVariables");
const friendship_1 = require("../utils/friendship");
const getReflectionForDate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, forUserId } = req.query;
        if (!req.userId) {
            throw new error_class_1.ErrorWithStatus("Invalid userId", 401);
        }
        const targetUserId = forUserId
            ? yield (0, friendship_1.requireFriendship)(req.userId, forUserId)
            : req.userId;
        console.log("Getting reflection for date and userId", date, targetUserId);
        const reflection = forUserId
            ? yield schemas_1.ReflectionModel.findOne({ user_id: (0, functionsAndVariables_1.idToObjectId)(targetUserId), date: new Date(date) })
            : yield (0, reflection_database_1.getReflectionFromDBOrCreate)(targetUserId, new Date(date));
        res.json({ success: true, data: reflection });
    }
    catch (err) {
        next(err);
    }
});
exports.getReflectionForDate = getReflectionForDate;
const getReflection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reflection_id } = req.params;
        const reflection = (yield schemas_1.ReflectionModel.findOne({ reflection_id }, { embedded_name: 0, __v: 0 }));
        if (!reflection) {
            throw new error_class_1.ErrorWithStatus("getReflectionError: Not found", 404);
        }
        res.json({ success: true, data: reflection });
    }
    catch (err) {
        next(err);
    }
});
exports.getReflection = getReflection;
const createReflection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.userId;
        const { date } = req.body;
        if (!user_id) {
            throw new error_class_1.ErrorWithStatus("Invalid userId", 401);
        }
        const createdReflection = yield (0, newReflection_1.createAndSaveReflectionForDate)(user_id, new Date(date));
        console.log("createdReflection", createdReflection);
        res.json({ success: true, data: createdReflection });
    }
    catch (err) {
        next(err);
    }
});
exports.createReflection = createReflection;
const putReflection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reflection_id } = req.params;
        // const result = await ReflectionModel.updateOne(
        //   { _id: reflection_id },
        //   { $set: req.body }
        // );
        const updatedReflection = req.body;
        // update Reflection
        const oldReflection = (yield schemas_1.ReflectionModel.findOneAndUpdate({ _id: reflection_id }, { $set: updatedReflection }, { returnDocument: "before",
            // creates new if non-existent
            upsert: true
        }
        // or returnOriginal: true for older versions
        ));
        // no await to save time
        updateLatestReflectionDateIfNeeded(oldReflection, updatedReflection);
        // # change data to true or so
        res.status(200).json({ success: true, data: 1 });
    }
    catch (err) {
        next(err);
    }
});
exports.putReflection = putReflection;
function updateLatestReflectionDateIfNeeded(oldReflection, updatedReflection) {
    return __awaiter(this, void 0, void 0, function* () {
        // check if completed status changed
        if (oldReflection.completed !== updatedReflection.completed) {
            const updateHappened = yield updateReflectionDateIfGreater(updatedReflection.date, (0, functionsAndVariables_1.idToObjectId)(updatedReflection.user_id));
            if (updateHappened) {
                console.log("User's latestReflectionDate updated successfully.");
            }
            else {
                console.log("No update needed for user's latestReflectionDate.");
            }
        }
    });
}
function updateReflectionDateIfGreater(updatedReflectionDate, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield schemas_1.UserModel.updateOne({ _id: userId }, [
            {
                $set: {
                    "reflectionDetails.latestReflectionDate": {
                        $cond: {
                            // check if update is needed:
                            if: {
                                $gt: [
                                    updatedReflectionDate,
                                    "$reflectionDetails.latestReflectionDate",
                                ],
                            },
                            then: updatedReflectionDate,
                            else: "$reflectionDetails.latestReflectionDate",
                        },
                    },
                },
            },
        ]);
        return result.modifiedCount > 0;
    });
}
const getReflectionStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, forUserId } = req.query;
        if (!req.userId) {
            throw new error_class_1.ErrorWithStatus("Invalid userId", 401);
        }
        const targetUserId = forUserId
            ? yield (0, friendship_1.requireFriendship)(req.userId, forUserId)
            : req.userId;
        console.log("Getting reflection stats for date range and userId", new Date(startDate), endDate, targetUserId);
        const stats = yield getReflectionStatsForDateRange(targetUserId, new Date(startDate), new Date(endDate));
        console.log("Requested ReflectionsStat:", stats);
        res.json({ success: true, data: stats });
    }
    catch (err) {
        next(err);
    }
});
exports.getReflectionStats = getReflectionStats;
const getReflectionStatsForDateRange = (user_id, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    const reflectionStats = yield schemas_1.ReflectionModel.aggregate([
        {
            $match: {
                user_id: (0, functionsAndVariables_1.idToObjectId)(user_id),
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: null,
                completed: { $sum: { $cond: ["$completed", 1, 0] } },
            },
        },
        {
            $project: {
                _id: 0, // Exclude `_id` field from the output
                completed: 1,
            },
        },
    ]);
    console.log("ReflectionStats:", reflectionStats);
    return reflectionStats[0];
});
