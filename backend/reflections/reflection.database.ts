import { ReflectionModel } from "../database/schemas";
import { getNewReflectionForDate } from "./newReflection";
import { Reflection } from "./reflections.types";

export const getReflectionFromDBOrCreate = async (user_id: string, date: Date) =>{
    //#do i need try catch?
    const reflection = await ReflectionModel.findOneAndUpdate(
        { user_id, date },
        { $setOnInsert: getNewReflectionForDate(user_id, date) },
        { new: true, upsert: true }
      );
    return reflection as Reflection;
}