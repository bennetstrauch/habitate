import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
  untracked,
} from '@angular/core';
import { HabitProgress } from '@backend/progresses/progress.types';
import { StandardResponse } from '@backend/types/standardResponse';
import { environment } from 'frontend/src/environments/environment';
import { GoalsService } from '../goals/goals.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  formatDateRangeToDisplay,
  formatDateToDisplayAsWeekMonthDay,
  toLocalDateString,
} from '../utils/utils';
import { Router } from '@angular/router';
import { Habit } from '@backend/goals/goals.types';
import { UpliftersService } from '../uplifters/uplifters.service';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  #router = inject(Router);
  #http = inject(HttpClient);
  readonly goalsService = inject(GoalsService);
  readonly upliftersService = inject(UpliftersService);

  $displayStats = signal<boolean>(false);
  $displayDailyProgress = computed(() => !this.$displayStats());

  // ########### rename dailyTimeStep
  $dailyProgressTimeStep = signal(0);
  // ## reset timestep?

  handleTimeStepChange = effect(() => {
    if (this.goalsService.$habitIds().length > 0) {
      this.handleProgressMappingToHabits(this.$dailyProgressDate());
    }
  });

  $dailyProgressDate = computed(() => this.calculateDateWithTimestep());

  $dateToShow = computed(() =>
    formatDateToDisplayAsWeekMonthDay(this.$dailyProgressDate())
  );

  // ________________________############might break
  handleDateChange = () => {
    this.handleProgressMappingToHabits(this.$dailyProgressDate());

    return formatDateToDisplayAsWeekMonthDay(this.$dailyProgressDate());
  };

  calculateDateWithTimestep = () => {
    const date = new Date();
    date.setDate(date.getDate() + this.$dailyProgressTimeStep());
    return date;
  };

  //#refactor
  handleProgressMappingToHabits(date: Date) {
    const dateString = toLocalDateString(date); // en-CA returns in YYYY-MM-DD format

    this.get_progresses_for_day(dateString).subscribe((response) => {
      if (response.success) {
        const progresses = response.data;

        this.mapProgressesToHabits(progresses, dateString);
      }
    });
  }

  // ## review + goals.flatmap needed? no i not have all habits somewhere?
  mapProgressesToHabits(progresses: HabitProgress[], dateString: string) {
  const noProgressHabitIds: string[] = [];

  this.goalsService.$goals().forEach((goal) => {
    goal.habits.forEach((habit) => {
      const progress = progresses.find(p => p.habit_id === habit._id);

      if (progress) {
        habit.latestProgress = progress;
      } else {
        noProgressHabitIds.push(habit._id);
      }
    });
  });

  if (noProgressHabitIds.length > 0 && !this.upliftersService.$isViewingUplifter()) {
    this.create_progresses_batch(dateString, noProgressHabitIds).subscribe((response) => {
      if (response.success) {
        response.data.forEach((newProgress) => {
          const habit = this.goalsService
            .$goals()
            .flatMap(goal => goal.habits)
            .find(h => h._id === newProgress.habit_id);
          if (habit) {
            habit.latestProgress = newProgress;
          }
        });
      } else {
        alert("Error creating batch progress entries.");
      }
    });
  }
}


  createNewProgressAndMapToHabit(habit: Habit, dateString: string) {
    console.log(
      'Creating new progress for habit: ',
      habit._id,
      ' and date: ',
      dateString
    );

    this.create_progress(dateString, habit._id).subscribe((response) => {
      if (response.success) {
        habit.latestProgress = response.data;
      } else {
        alert(
          'ERROR: SORRY! - Progress for that day could not be saved in database. Please try again later. We switched to today.'
        );
        console.error('No progress created. Error: ', response.data);

        this.#router.navigate(['', 'goals']).then(() => {
          window.location.reload();
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
    const habit_ids = this.goalsService.$habitIds().join(',');

    const params = new HttpParams()
      .set('date', dateStringWithoutTime)
      .set('habit_ids', habit_ids);

    return this.#http.get<StandardResponse<HabitProgress[]>>(
      environment.SERVER_URL + '/progresses',
      { params }
    );
  }

  create_progress(date: string, habit_id: string) {
    return this.#http.post<StandardResponse<HabitProgress>>(
      environment.SERVER_URL + '/progresses',
      { date, habit_id }
      // # latest progress, see in reflecions
    );
  }

  create_progresses_batch(date: string, habit_ids: string[]) {
  return this.#http.post<StandardResponse<HabitProgress[]>>(
    environment.SERVER_URL + '/progresses/batch',
    { date, habit_ids }
  );
}

  put_progress(progress: HabitProgress) {
    return this.#http.put<StandardResponse<number>>(
      environment.SERVER_URL + '/progresses' + '/' + progress._id,
      progress
    );
  }
}
