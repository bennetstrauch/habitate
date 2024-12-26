import { Schema, model, InferSchemaType } from 'mongoose';


const habitSchema = new Schema({
    name: { type: String, required: true},
    description: String
})


// #type
const habitsValidator = { 
    validator: function(habits : Habit[]) {
        return habits.length <= 3
    },
    message: () => `You should not have more than 3 habits per goal to keep it simple. Delete one to add a new one.`
}

// ##standardize from base
const goalSchema = new Schema({

    name: { type: String, required: true},
    embedded_name: {type: [Number], required: false},

    description: String,


    createdByUserWithId: Schema.Types.ObjectId,

    habits: { type: [habitSchema], validate: habitsValidator, required: false }
})



export interface GoalBase extends EntityBase {}


// export type GoalBase = InferSchemaType<typeof goalSchema>



interface EntityBase {
    name: string,
    description?: string,
}

export interface HabitBase extends EntityBase {}

export interface Habit extends HabitBase {
    _id: string
}


export interface Goal extends EntityBase {
    _id: string
    createdByUserWithId: string
    
    habits: Habit[]
}

export const GoalModel = model<Goal>('goal', goalSchema)

