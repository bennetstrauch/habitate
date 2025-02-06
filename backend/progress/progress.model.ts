import { model, ObjectId, Schema } from "mongoose";

const habitProgressSchema = new Schema({
  habit_id: { type: Schema.Types.ObjectId, ref: "Habit", required: true },
  date: { type: Date, required: true }, // Use ISO date without time for daily tracking
  completed: { type: Boolean, required: true }, // Indicates if the habit was done on this date
  attempted: { type: Boolean, required: true }, // Indicates if the habit was attempted on this date
});

export const HabitProgressModel = model<HabitProgress>(
  "HabitProgress",
  habitProgressSchema
);

export interface HabitProgressBase {
  date: Date;

  completed: boolean;
  attempted: boolean;
}

export interface HabitProgress extends HabitProgressBase {
  _id: string; // #better?

  habit_id: string;
}
