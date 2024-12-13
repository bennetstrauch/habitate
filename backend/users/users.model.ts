import { InferSchemaType, model, Schema } from "mongoose";


const userSchema = new Schema({
    username: { type: String, required: true, unique: true, minlength: 3 },
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true, minlength: 6 },
    
})



export type User = InferSchemaType<typeof userSchema>

export const UserModel = model<User>('user', userSchema)