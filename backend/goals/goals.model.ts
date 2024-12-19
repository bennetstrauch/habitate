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


const goalSchema = new Schema({

    name: { type: String, required: true},
    description: String,

    createdByUserWithId: Schema.Types.ObjectId,

    habits: { type: [habitSchema], validate: habitsValidator, required: false }
})





export type GoalBase = InferSchemaType<typeof goalSchema>

export const GoalModel = model<GoalBase>('goal', goalSchema)


interface EntityBase {
    name: string,
    description?: string,
}

export interface Habit extends EntityBase {

}

export interface Goal extends EntityBase {
    _id: string
    createdByUserWithId: string
    
    habits: Habit[]
}

