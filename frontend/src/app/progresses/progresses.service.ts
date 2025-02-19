import { effect, inject, Injectable, signal } from '@angular/core';
import {
  HabitProgress,
  ProgressStat,
  ProgressStatBase,
} from '@backend/progress/progress.types';
import { StandardResponse } from '@backend/types/standardResponse';
// ### import the other environment variable!!!#######
import { environment } from 'frontend/src/environments/environment';
import { GoalsService } from '../goals/goals.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { getTimezone } from '../utils/utils';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  #router = inject(Router);
  #http = inject(HttpClient);
  readonly goalsService = inject(GoalsService);

  $progressStats = signal<Map<string, ProgressStatBase>>(new Map());
  $displayStats = signal<boolean>(false);

  constructor() {
    // Automatically fetch progress stats whenever habit IDs change
    effect(() => {
      if (this.goalsService.$habitIds().length > 0) {
        this.loadProgressStats();
      }
    });
  }

  loadProgressStats() {
    this.getProgressStats('week', 0, this.goalsService.$habitIds()).subscribe(
      (response) => {
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
      }
    );
  }

  mapProgressesForDayToHabits(date: Date) {
    const dateString = date.toLocaleDateString('en-CA'); // en-CA returns in YYYY-MM-DD format

    this.get_progresses_for_day(dateString).subscribe((response) => {
      if (response.success) {
        const progresses = response.data;

        this.goalsService.$goals().forEach((goal) => {
          goal.habits.forEach((habit) => {
            const progress: HabitProgress | undefined = progresses.find(
              (progress) => progress.habit_id === habit._id
            );

            if (progress) {
              habit.latestProgress = progress;
            }
            // not a goos solution # throw error or beter maybe: create new progress in db
            else {
              console.log('No progress found for habit: ', habit._id);
              console.log(
                'Creating new progress for habit: ',
                habit._id,
                ' and date: ',
                dateString
              );
              this.create_progress(dateString, habit._id).subscribe(
                (response) => {
                  if (response.success) {
                    habit.latestProgress = response.data;
                  } else {
                    // sth similar to this:##
                    alert(
                      'ERROR: SORRY! - Progress for that day could not be saved in database. Please try again later. We switched to today.'
                    );
                    console.error(
                      'No progress created. Error: ',
                      response.data
                    );

                    this.#router.navigate(['', 'goals']).then(() => {
                      window.location.reload();
                    });
                  }
                }
              );
            }
          });
        });
      }
    });
  }

  // _______ http calls __________________________________________

  // ## not used so far.
  get_progress(progress_id: string) {
    return this.#http.get<StandardResponse<HabitProgress[]>>(
      environment.SERVER_URL + 'progresses' + '/' + progress_id
    );
  }

  get_progresses_for_day(dateStringWithoutTime: string) {
    const params = new HttpParams()
      .set('date', dateStringWithoutTime)
      .set('habit_ids', this.goalsService.$habitIds().join(','));

    return this.#http.get<StandardResponse<HabitProgress[]>>(
      environment.SERVER_URL + '/progresses',
      { params }
    );
  }

  create_progress(date: string, habit_id: string) {
    return this.#http.post<StandardResponse<HabitProgress>>(
      environment.SERVER_URL + '/progresses',
      { date, habit_id }
    );
  }

  put_progress(progress: HabitProgress) {
    return this.#http.put<StandardResponse<number>>(
      environment.SERVER_URL + '/progresses' + '/' + progress._id,
      progress
    );
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
