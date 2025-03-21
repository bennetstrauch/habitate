import mongoose from "mongoose";

export const generateObjectIdAsString = (): string =>
    new mongoose.Types.ObjectId().toString();