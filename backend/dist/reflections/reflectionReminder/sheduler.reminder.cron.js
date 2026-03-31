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
const node_cron_1 = __importDefault(require("node-cron"));
const luxon_1 = require("luxon");
const email_reminder_1 = require("./email.reminder");
const push_reminder_1 = require("./push.reminder");
const schemas_1 = require("../../database/schemas");
node_cron_1.default.schedule("00,15,27,30,45 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Running reflection reminder job at: ", new Date());
    const nowUTC = luxon_1.DateTime.utc();
    const reminderDetailsForMatchingUsers = yield schemas_1.UserModel.aggregate([
        // First stage: Filter users with enableEmail or enablePush
        {
            $match: {
                $or: [
                    { "reflectionDetails.enableEmail": true },
                    { "reflectionDetails.enablePush": true },
                ],
            },
        },
        // Second stage: Check reflectionReminderTime and latestReflectionDate
        {
            $match: {
                $expr: {
                    $and: [
                        // Condition 1: reflectionReminderTime within 14 minutes before to equal current time
                        {
                            $and: [
                                {
                                    $gte: [
                                        "$reflectionDetails.reflectionReminderTime",
                                        {
                                            $dateToString: {
                                                date: { $subtract: [new Date(), 14 * 60 * 1000] }, // 14 minutes ago
                                                timezone: "$timezone",
                                                format: "%H:%M",
                                            },
                                        },
                                    ],
                                },
                                {
                                    $lte: [
                                        "$reflectionDetails.reflectionReminderTime",
                                        {
                                            $dateToString: {
                                                date: new Date(),
                                                timezone: "$timezone",
                                                format: "%H:%M",
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        // Condition 2: latestReflectionDate < today's date in user's timezone
                        {
                            $and: [
                                { $ne: ["$reflectionDetails.latestReflectionDate", null] },
                                {
                                    $lt: [
                                        "$reflectionDetails.latestReflectionDate",
                                        {
                                            $dateFromString: {
                                                dateString: {
                                                    $dateToString: {
                                                        date: new Date(),
                                                        timezone: "$timezone",
                                                        format: "%Y-%m-%d",
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
        },
        {
            $project: {
                user_id: "$_id",
                _id: 0,
                username: "$name",
                email: 1,
                timezone: 1,
                reflectionReminderTime: "$reflectionDetails.reflectionReminderTime",
                latestReflectionDate: "$reflectionDetails.latestReflectionDate",
                enableEmail: "$reflectionDetails.enableEmail",
                enablePush: "$reflectionDetails.enablePush",
                pushSubscriptions: "$reflectionDetails.pushSubscriptions", // Updated to fetch array
            },
        },
    ]);
    console.log("Reminder details for matching users:", reminderDetailsForMatchingUsers);
    for (const reminderDetails of reminderDetailsForMatchingUsers) {
        if (reminderDetails.enableEmail)
            yield (0, email_reminder_1.sendEmailReminder)(reminderDetails);
        if (reminderDetails.enablePush)
            yield (0, push_reminder_1.sendPushReminder)(reminderDetails);
    }
}));
