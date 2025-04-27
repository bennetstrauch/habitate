import { Schema, model, InferSchemaType } from "mongoose";
import { Goal, Habit } from "../goals/goals.types";
import { HabitProgress } from "../progresses/progress.types";
import { ReflectionDetails, User } from "../users/users.types";
import { Reflection } from "../reflections/reflections.types";
import { PushSubscription } from "web-push";

const PushSubscriptionSchema = new Schema<PushSubscription>(
  {
    endpoint: { type: String, required: false },
    expirationTime: { type: Number, required: false },
    keys: {
      p256dh: { type: String, required: false },
      auth: { type: String, required: false },
    },
  },
  { _id: false }
);

const ReflectionDetailsSchema = new Schema<ReflectionDetails>(
  {
    reflectionReminderTime: { type: String, required: false },
    enableEmail: { type: Boolean, required: true, default: false },
    enablePush: { type: Boolean, required: true, default: false },
    pushSubscription: { type: PushSubscriptionSchema, required: false },
    latestReflectionDate: { type: Date, required: false },
  },
  { _id: false }
);

const userSchema = new Schema<User>({
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
});

export const UserModel = model<User>("user", userSchema);

const habitSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  // #make it required later on, default maybee 7?
  frequency: { type: Number, default: 7 },

  latestProgress: {
    type: Schema.Types.ObjectId,
    ref: "HabitProgress", // Reference to the HabitProgress model
    default: null,
    required: true,
  },
});

// #type
const habitsValidator = {
  validator: function (habits: Habit[]) {
    return habits.length <= 3;
  },
  message: () =>
    `You should not have more than 3 habits per goal to keep it simple. Delete one to add a new one.`,
};

const goalSchema = new Schema({
  name: { type: String, required: true },
  embedded_name: { type: [Number], required: false },

  description: String,

  createdByUserWithId: Schema.Types.ObjectId,

  habits: { type: [habitSchema], validate: habitsValidator, required: false },

  ranking: Number,
});

export const GoalModel = model<Goal>("goal", goalSchema);

const habitProgressSchema = new Schema({
  habit_id: { type: Schema.Types.ObjectId, ref: "Habit", required: true },
  date: { type: Date, required: true }, // Use ISO date without time for daily tracking
  completed: { type: Boolean, required: true }, // Indicates if the habit was done on this date
  attempted: { type: Boolean, required: true }, // Indicates if the habit was attempted on this date
});

// ##consider adding an index on habit_id and date

export const HabitProgressModel = model<HabitProgress>(
  "HabitProgress",
  habitProgressSchema
);

const reflectionSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },

  type: { type: String, enum: ["daily", "weekly"], required: true },
  date: { type: Date, required: true },
  completed: { type: Boolean, required: true },

  intention: { type: String, required: false },
  whatWentWell: { type: String, required: false },

  dailyReflectionsCompleted: { type: Number, required: false },
});

export const ReflectionModel = model<Reflection>(
  "Reflection",
  reflectionSchema
);
