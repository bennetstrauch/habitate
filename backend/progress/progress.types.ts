export interface HabitProgressBase {
  date: Date;

  completed: boolean;
  attempted: boolean;
}

export interface HabitProgress extends HabitProgressBase {
  _id: string; // #better?

  habit_id: string;
}
