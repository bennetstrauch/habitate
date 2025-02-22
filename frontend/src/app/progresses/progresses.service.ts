import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  HabitProgress,
  ProgressStat,
  ProgressStatBase,
  ProgressStatsForDateRange,
} from '@backend/progress/progress.types';
import { StandardResponse } from '@backend/types/standardResponse';
// ### import the other environment variable!!!#######
import { environment } from 'frontend/src/environments/environment';
import { GoalsService } from '../goals/goals.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  formatDateRangeToDisplay,
  formatDateToDisplayAsWeekMonthDay,
  toLocalDateString,
} from '../utils/utils';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  #router = inject(Router);
  #http = inject(HttpClient);
  readonly goalsService = inject(GoalsService);

  $displayStats = signal<boolean>(false);
  $displayDailyProgress = computed(() => !this.$displayStats());

  $currentTimeStep = signal(0);
  // ## to seperate limit of only -2 for prgoress stats:
  // $currentDayStep = signal(0)

  resetTimeStep = effect(() => {
    if(this.$displayStats())
    this.$currentTimeStep.set(0);
  })

  $dateOrDateRangeToShow = computed(() => {
    if (this.$displayDailyProgress()) {
      console.log('handleDateChange', this.handleDateChange());
      return this.handleDateChange();
    }

    if (this.$displayStats()) {
      return formatDateRangeToDisplay(
        this.$progressDateRange().startDate,
        this.$progressDateRange().endDate
      );
    }

    return '';
  });

  handleDateChange = () => {
    const date = this.calculateDateWithTimestep();
    this.mapProgressesForDayToHabits(date);

    return formatDateToDisplayAsWeekMonthDay(date);
  };

  calculateDateWithTimestep = () => {
    const date = new Date();
    date.setDate(date.getDate() + this.$currentTimeStep());
    return date;
  };

  $progressStatsMap = signal<Map<string, ProgressStatBase>>(new Map());
  // ### own type!
  $progressDateRange = signal<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  // loadProgressStatsForTimeframe = effect(() => {
  //     this.loadProgressStats(this.goalsService.$currentTimeStep());
  // });

  constructor() {
    // Automatically fetch progress stats whenever habit IDs change ## need first comparison?
    //# also gets fetched everytie we toggle, do different?#
    effect(() => {
      if (this.goalsService.$habitIds().length > 0 && this.$displayStats()) {
        console.log('loading progress stats');
        this.loadProgressStats(this.$currentTimeStep());
      }
    });
  }

  // ## change!!!
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

  mapProgressesForDayToHabits(date: Date) {
    const dateString = toLocalDateString(date); // en-CA returns in YYYY-MM-DD format

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
