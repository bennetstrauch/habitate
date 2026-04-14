import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
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
  $progressLoaded = signal(false);
  $progressMap = signal<Map<string, HabitProgress>>(new Map());

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
    const dateString = toLocalDateString(date);
    this.$progressLoaded.set(false);

    this.get_progresses_for_day(dateString).subscribe((response) => {
      if (response.success && dateString === toLocalDateString(this.$dailyProgressDate())) {
        this.mapProgressesToHabits(response.data, dateString);
      }
    });
  }

  mapProgressesToHabits(progresses: HabitProgress[], dateString: string) {
    const map = new Map(progresses.map(p => [p.habit_id, p]));

    const noProgressHabitIds = this.goalsService.$goals()
      .flatMap(g => g.habits)
      .filter(h => !map.has(h._id))
      .map(h => h._id);

    if (noProgressHabitIds.length > 0 && !this.upliftersService.$isViewingUplifter()) {
      this.create_progresses_batch(dateString, noProgressHabitIds).subscribe((response) => {
        if (response.success) {
          response.data.forEach(p => map.set(p.habit_id, p));
        }
        this.$progressMap.set(new Map(map));
        this.$progressLoaded.set(true);
      });
    } else {
      this.$progressMap.set(map);
      this.$progressLoaded.set(true);
    }
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
