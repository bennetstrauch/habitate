import { Schema, model, InferSchemaType } from 'mongoose';
import { Goal, Habit } from '../goals/goals.model';
import { HabitProgress } from '../progress/progress.model';

const habitSchema = new Schema({
    name: { type: String, required: true},
    description: String,

    latestProgress: {
        type: Schema.Types.ObjectId,
        ref: 'HabitProgress', // Reference to the HabitProgress model
        default: null,
        required: true
    },
})

  // #type
  const habitsValidator = { 
    validator: function(habits : Habit[]) {
        return habits.length <= 3
    },
    message: () => `You should not have more than 3 habits per goal to keep it simple. Delete one to add a new one.`
}



const goalSchema = new Schema({

    name: { type: String, required: true},
    embedded_name: {type: [Number], required: false},

    description: String,


    createdByUserWithId: Schema.Types.ObjectId,

    habits: { type: [habitSchema], validate: habitsValidator, required: false },

    ranking: Number
})

export const GoalModel = model<Goal>('goal', goalSchema)


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




