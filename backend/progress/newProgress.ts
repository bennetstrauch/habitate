import { HabitProgress } from "./progress.types";
import { generateObjectIdAsString } from "../utils/generateObjectId";

export const getNewProgressForDate = (
  habit_id: string,
  date: Date
): HabitProgress => {
  return {
    _id: generateObjectIdAsString(), //#check type later on
    habit_id: habit_id,

    date: date,
    completed: false,
    attempted: false,
  } as HabitProgress;
};
