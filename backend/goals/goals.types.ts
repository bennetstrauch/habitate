import { HabitProgress } from "../progress/progress.types";

interface EntityBase {
  name: string;
  description?: string;
}

export interface HabitBase extends EntityBase {
  //#remove ? after test done, also defualt value?
  frequency?: number;
}

export interface Habit extends HabitBase {
  _id: string;
  latestProgress: HabitProgress;
}

export interface GoalBase extends EntityBase {}

export interface Goal extends EntityBase {
  _id: string;
  createdByUserWithId: string;
  embedded_name: number[];

  habits: Habit[];

  ranking: number;
}
