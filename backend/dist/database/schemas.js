"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectionModel = exports.HabitProgressModel = exports.GoalModel = exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const PushSubscriptionSchema = new mongoose_1.Schema({
    endpoint: { type: String, required: false },
    expirationTime: { type: Number, required: false },
    keys: {
        p256dh: { type: String, required: false },
        auth: { type: String, required: false },
    },
}, { _id: false });
const ReflectionDetailsSchema = new mongoose_1.Schema({
    reflectionReminderTime: { type: String, required: false },
    enableEmail: { type: Boolean, required: true, default: false },
    enablePush: { type: Boolean, required: true, default: false },
    pushSubscriptions: {
        type: [PushSubscriptionSchema],
        required: false,
        default: [],
    },
    latestReflectionDate: { type: Date, required: false },
    firstEmailReceived: { type: Boolean, required: false, default: false },
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, minlength: 3 },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    timezone: { type: String, required: true },
    reflectionTrigger: { type: String, required: true },
    reflectionDetails: { type: ReflectionDetailsSchema, required: false },
    tourCompleted: { type: Boolean, default: false },
    inviteCode: { type: String, required: false, sparse: true },
    connections: { type: [mongoose_1.Schema.Types.ObjectId], ref: "user", default: [] },
});
exports.UserModel = (0, mongoose_1.model)("user", userSchema);
const habitSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: String,
    // #make it required later on, default maybee 7?
    frequency: { type: Number, default: 7 },
    latestProgress: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "HabitProgress", // Reference to the HabitProgress model
        default: null,
        required: true,
    },
});
// #type
const habitsValidator = {
    validator: function (habits) {
        return habits.length <= 3;
    },
    message: () => `You should not have more than 3 habits per goal to keep it simple. Delete one to add a new one.`,
};
const goalSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    embedded_name: { type: [Number], required: false },
    description: String,
    createdByUserWithId: mongoose_1.Schema.Types.ObjectId,
    habits: { type: [habitSchema], validate: habitsValidator, required: false },
    ranking: Number,
});
exports.GoalModel = (0, mongoose_1.model)("goal", goalSchema);
const habitProgressSchema = new mongoose_1.Schema({
    habit_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Habit", required: true },
    date: { type: Date, required: true }, // Use ISO date without time for daily tracking
    completed: { type: Boolean, required: true }, // Indicates if the habit was done on this date
    attempted: { type: Boolean, required: true }, // Indicates if the habit was attempted on this date
});
// ##consider adding an index on habit_id and date
exports.HabitProgressModel = (0, mongoose_1.model)("HabitProgress", habitProgressSchema);
const reflectionSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["daily", "weekly"], required: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, required: true },
    intention: { type: String, required: false },
    whatWentWell: { type: String, required: false },
    dailyReflectionsCompleted: { type: Number, required: false },
});
exports.ReflectionModel = (0, mongoose_1.model)("Reflection", reflectionSchema);
