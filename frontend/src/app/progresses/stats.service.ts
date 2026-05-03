import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  ProgressStatsForDateRange,
  StatBase,
} from '@backend/progresses/progress.types';
import { StandardResponse } from '@backend/types/standardResponse';
import { environment } from 'frontend/src/environments/environment';
import { GoalsService } from '../goals/goals.service';
import { calculateStartAndEndDate, formatDateRangeToDisplay, formatMonthToDisplay } from '../utils/utils';
import { ProgressPeriod } from './progress-period.enum';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  #http = inject(HttpClient);
  goalsService = inject(GoalsService);

  $statsTimeStep = signal(0);
  $period = signal<ProgressPeriod>(ProgressPeriod.Week);
  $minStep = computed(() => this.$period() === ProgressPeriod.Week ? -7 : -12);

  $progressDateRange = computed(() =>
    calculateStartAndEndDate(this.$period(), this.$statsTimeStep())
  );

  $dateRangeToShow = computed(() => {
    const { startDate, endDate } = this.$progressDateRange();
    return this.$period() === ProgressPeriod.Month
      ? formatMonthToDisplay(startDate)
      : formatDateRangeToDisplay(startDate, endDate);
  });

  $progressStatsMap = signal<Map<string, StatBase>>(new Map());

  constructor() {
    effect(() => {
      const step = this.$statsTimeStep();
      this.$period(); // track period so effect reruns on period change
      if (this.goalsService.$habitIds().length > 0) {
        this.loadProgressStats(step);
      }
    });
  }

  loadProgressStats(currentTimeStep: number) {
    this.getProgressStats(this.$period(), currentTimeStep, this.goalsService.$habitIds())
      .subscribe((response) => {
        if (response.success) {
          const statsMap = new Map(
            response.data.progressStats.map((s) => [
              s._id,
              { total: s.total, completed: s.completed },
            ])
          );
          this.$progressStatsMap.set(statsMap);
        }
      });
  }

  getProgressStats(period: 'week' | 'month', offset = 0, habitIds: string[]) {
    const params = new HttpParams()
      .set('period', period)
      .set('offset', offset.toString())
      .set('date', new Date().toLocaleDateString('en-CA'))
      .set('habit_ids', habitIds.join(','));

    return this.#http.get<StandardResponse<ProgressStatsForDateRange>>(
      environment.SERVER_URL + '/progresses/stats',
      { params }
    );
  }
}
