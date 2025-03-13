import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  ProgressStatsForDateRange,
  StatBase,
} from '@backend/progresses/progress.types';
import { StandardResponse } from '@backend/types/standardResponse';
import { environment } from 'frontend/src/environments/environment';
import { GoalsService } from '../goals/goals.service';
import { formatDateRangeToDisplay } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  #http = inject(HttpClient);
  goalsService = inject(GoalsService);

  constructor() {
    effect(() => {
   
          if (this.goalsService.$habitIds().length > 0 ) {
            console.log('loading progress stats');
            this.loadProgressStats(this.$statsTimeStep());
          }
        });
  }

  $statsTimeStep = signal(0);

  $progressDateRange = signal<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  $dateRangeToShow = computed(() => formatDateRangeToDisplay(
    this.$progressDateRange().startDate,
    this.$progressDateRange().endDate
  ));


  $progressStatsMap = signal<Map<string, StatBase>>(new Map());

 


  // ____________________ METHODS ____________________

  loadProgressStats(currentTimeStep: number) {
    this.getProgressStats(
      'week',
      currentTimeStep,
      this.goalsService.$habitIds()
    ).subscribe((response) => {
      if (response.success) {
        const statsMap = new Map(
          response.data.progressStats.map((progressStat) => [
            progressStat._id,
            { total: progressStat.total, completed: progressStat.completed },
          ])
        );
        console.log('statsMap: ', statsMap, 'response.data: ', response.data);
        this.$progressStatsMap.set(statsMap); // Update the signal
        this.$progressDateRange.set({
          startDate: response.data.startDate.split('T')[0],
          endDate: response.data.endDate.split('T')[0],
        });
      }
    });
  }

  // ____________________ HTTP REQUESTS ____________________

  getProgressStats(period: 'week' | 'month', offset = 0, habitIds: string[]) {
    const params = new HttpParams()
      .set('period', period)
      .set('offset', offset.toString())
      .set('date', new Date().toLocaleDateString('en-CA')) // #have a method in utils
      .set('habit_ids', habitIds.join(',')); // Converting array to CSV format

    return this.#http.get<StandardResponse<ProgressStatsForDateRange>>(
      environment.SERVER_URL + '/progresses/stats',
      {
        params,
      }
    );
  }
}
