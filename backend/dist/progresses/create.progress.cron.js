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
exports.createDailyReflectionForUserIds = createDailyReflectionForUserIds;
exports.createHabitProgressesForUserIds = createHabitProgressesForUserIds;
exports.createDailyHabitProgressForGoals = createDailyHabitProgressForGoals;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const schemas_1 = require("../database/schemas");
const newProgress_1 = require("./newProgress");
const newReflection_1 = require("../reflections/newReflection");
//
function getTimeZonesStartingNewDay() {
    const now = moment_timezone_1.default.utc();
    const timeZones = moment_timezone_1.default.tz.names();
    return timeZones.filter((tz) => {
        const zoneTime = now.clone().tz(tz);
        return zoneTime.hours() === 0;
    });
}
function getUserIdsForTimeZones(timeZones, date) {
    return __awaiter(this, void 0, void 0, function* () {
        // Returns distinc user ids whose timezone is in the timezonesStrartingNewDay array:
        const userIds = (yield schemas_1.UserModel.distinct("_id", {
            timezone: { $in: timeZones },
        }));
        return userIds;
    });
}
// ##### can be removed most likely
// Runs every hour, on the hour
// # should we check for existing progress and only create if not existing?
// cron.schedule("0 * * * *", async () => {
//   console.log("Running create progress cron job at: ", new Date());
//   const timeZones = getTimeZonesStartingNewDay();
//   const date = getDateForTimezone(timeZones[0])
//   const userIds = await getUserIdsForTimeZones(timeZones, date);
//   if (userIds.length > 0) {
//     console.log(
//       "Creating progresses and dailyReflection for users: ",
//       userIds,
//       "and timeZones: ",
//       timeZones,
//       "at date: ",
//       date
//     );
//   }
//   await createHabitProgressesForUserIds(userIds, date);
//   await createDailyReflectionForUserIds(userIds, date);
// });
function createDailyReflectionForUserIds(userIds, date) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const userId of userIds) {
            const reflection = yield (0, newReflection_1.createAndSaveReflectionForDate)(userId, date);
        }
    });
}
function createHabitProgressesForUserIds(userIds, date) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const userId of userIds) {
            const goals = yield schemas_1.GoalModel.find({ createdByUserWithId: userId }, { habits: 1 });
            yield createDailyHabitProgressForGoals(goals, date);
        }
    });
}
function createDailyHabitProgressForGoals(goals, date) {
    return __awaiter(this, void 0, void 0, function* () {
        const newProgresses = [];
        //# ask chatgpt for cleaner code
        for (const goal of goals) {
            for (const habit of goal.habits) {
                const newProgress = (0, newProgress_1.getNewProgressForDate)(habit._id, date);
                habit.latestProgress = newProgress; // ## could getDate once for all if opt. needed
                newProgresses.push(newProgress);
            }
        }
        if (newProgresses.length !== 0) {
            yield schemas_1.HabitProgressModel.insertMany(newProgresses);
            // ## if performance is an issue, not awaiting will be faster
            const result = yield schemas_1.GoalModel.bulkWrite(goals.map((goal) => ({
                updateOne: {
                    filter: { _id: goal._id },
                    update: { $set: { habits: goal.habits } },
                },
            })));
        }
        return goals;
    });
}
