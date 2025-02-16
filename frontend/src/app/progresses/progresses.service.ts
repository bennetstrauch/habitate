import { effect, inject, Injectable, signal } from '@angular/core';
import { HabitProgress, ProgressStat, ProgressStatBase } from '@backend/progress/progress.types';
import { StandardResponse } from '@backend/types/standardResponse';
// ### import the other environment variable!!!#######
import { environment } from 'frontend/src/environments/environment';
import { GoalsService } from '../goals/goals.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { getTimezone } from '../utils/utils';
import { Habit } from '@backend/goals/goals.types';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  #http = inject(HttpClient);
  readonly goalsService = inject(GoalsService);

  $progressStats = signal<Map<string, ProgressStatBase>>(new Map());
  $displayStats = signal<boolean>(false);
  


  constructor() {
    // Automatically fetch progress stats whenever habit IDs change
    effect(() => {
      if (this.goalsService.$habitIds().length > 0){
        this.loadProgressStats();

      }
    });
  }

  // ## not used so far.
  get_progress(progress_id: string) {
    return this.#http.get<StandardResponse<HabitProgress[]>>(
      environment.SERVER_URL + 'progresses' + '/' + progress_id
    );
  }

  put_progress(progress: HabitProgress) {
    return this.#http.put<StandardResponse<number>>(
      environment.SERVER_URL + '/progresses' + '/' + progress._id,
      progress
    );
  }

  loadProgressStats() {
    this.getProgressStats('week', 0, this.goalsService.$habitIds()).subscribe((response) => {
      if (response.success) {
        const statsMap = new Map(
          response.data.map((progressStat) => [
            progressStat._id,
            { total: progressStat.total, completed: progressStat.completed },
          ])
        );
        console.log('statsMap: ', statsMap);
        this.$progressStats.set(statsMap); // Update the signal
      }
    });
  }



   getProgressStats(period: 'week' | 'month', offset = 0, habitIds: string[]) {
    const params = new HttpParams()
      .set('period', period)
      .set('offset', offset.toString()) 
      .set('timezone', getTimezone()) // #standardize with BE
      .set('habit_ids', habitIds.join(',')); // Converting array to CSV format

    return this.#http.get<StandardResponse<ProgressStat[]>>(
      environment.SERVER_URL + '/progresses/stats',
      {
        params,
      }
    );
  }
}

