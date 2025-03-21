export interface HabitProgressBase {
  date: Date;

  completed: boolean;
  attempted: boolean;
}

export interface HabitProgress extends HabitProgressBase {
  _id: string; // #better?

  habit_id: string;
}

export interface StatBase {
  // ## no longer needed
  total?: number;
  completed: number;
}
export interface ProgressStat extends StatBase {
  _id: string;
}

export interface ProgressStatsForDateRange {
  progressStats: ProgressStat[];
  startDate: String;
  endDate: String;
}

export interface dailyLog {
  _id: string;
  user_id: string;

  date: Date;
  progresses: HabitProgress[];
}
