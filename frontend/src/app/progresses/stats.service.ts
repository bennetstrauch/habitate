import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import {
  ProgressStatsForDateRange,
  StatBase,
} from '@backend/progresses/progress.types';
import { StandardResponse } from '@backend/types/standardResponse';
import { environment } from 'frontend/src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  #http = inject(HttpClient);

  constructor() {}

  $statsTimeStep = signal(0);

  $progressDateRange = signal<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  $progressStatsMap = signal<Map<string, StatBase>>(new Map());

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
