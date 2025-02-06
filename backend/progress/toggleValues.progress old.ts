import { HabitProgressModel } from "./progress.model";

async function toggleCompleted(habitId: string, date: string): Promise<boolean> {

    const habitProgress = await HabitProgressModel.findOne({ habitId, date });
  
    if (habitProgress) {
      const newCompletedStatus = !habitProgress.completed;
      habitProgress.completed = newCompletedStatus;
      
      // Automatically set attempted to true if completed is set to true
      if (newCompletedStatus) {
        habitProgress.attempted = true;
      }
  
      await habitProgress.save();
        return newCompletedStatus;

    } else {
      throw new Error('HabitProgress not found for the given date and habitId');
    }
  }
  