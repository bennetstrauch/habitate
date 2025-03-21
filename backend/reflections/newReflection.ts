import { ReflectionModel } from "../database/schemas";
import { generateObjectIdAsString } from "../utils/generateObjectId";
import { Reflection } from "./reflections.types";

export const getNewReflectionForDate = (
  user_id: string,
  date: Date
): Reflection => {
  return {
    _id: generateObjectIdAsString(),
    user_id: user_id,

    //#maybe dynamic for weekly
    type: "daily",
    date: date,
    completed: false,
  };
};


// # needed?
export const createAndSaveReflectionForDate = async (
  user_id: string,
  date: Date
): Promise<Reflection> => {
  //
  const newReflection = getNewReflectionForDate(user_id, date);
  return await ReflectionModel.create(newReflection);
};
