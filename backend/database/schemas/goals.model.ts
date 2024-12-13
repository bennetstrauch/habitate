import { Schema, model, InferSchemaType } from 'mongoose';


const habbitSchema = new Schema({
    name: { type: String, required: true},
    description: String
})


// #type
const habbitsValidator = { 
    validator: function(v) {
        return v.length <= 3
    },
    message: () => `You should not have more than 3 habbits per goal to keep it simple. Delete one to add a new one.`
}


const goalSchema = new Schema({
    name: { type: String, required: true},
    description: String,

    createdByUserWithId: Schema.Types.ObjectId,

    habbits: { type: [habbitSchema], validate: habbitsValidator }
})



export type Goal = InferSchemaType<typeof goalSchema>

export const GoalModel = model<Goal>('goal', goalSchema)

