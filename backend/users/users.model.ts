import { InferSchemaType, model, Schema } from "mongoose";


const userSchema = new Schema({
    name: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true, minlength: 6 },

    reflectionTrigger: { type: String, required: true}
})



export type User = InferSchemaType<typeof userSchema>

export const UserModel = model<User>('user', userSchema)