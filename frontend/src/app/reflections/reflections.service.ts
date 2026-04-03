import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { Reflection } from '@backend/reflections/reflections.types';
import { environment } from 'frontend/src/environments/environment';
import { ProgressService } from '../progresses/progresses.service';
import { toLocalDateString } from '../utils/utils';
import { StatBase } from '@backend/progresses/progress.types';
import { StatsService } from '../progresses/stats.service';
import { UpliftersService } from '../uplifters/uplifters.service';

@Injectable({
  providedIn: 'root',
})
export class ReflectionsService {
  #http = inject(HttpClient);
  progressService = inject(ProgressService);
  statsService = inject(StatsService);
  upliftersService = inject(UpliftersService);

  $reflection = signal<Reflection | null>(null);
  $previousDayIntention = signal<string | null>(null);
  $displayedIntention = computed(() => this.$reflection()?.intention ?? this.$previousDayIntention() ?? undefined);

  $reflectionStats = signal<StatBase | null>(null);
  // ## effect on change of timestep, but we need separted timesteps for stats and dailyprogress

  // for daily progress — re-runs when date OR active profile changes
  setReflectionOnDateChange = effect(() => {
    const dateString = toLocalDateString(
      this.progressService.$dailyProgressDate()
    );
    const forUserId = this.upliftersService.$isViewingUplifter()
      ? this.upliftersService.$activeProfileId()
      : undefined;

    this.$previousDayIntention.set(null);
    this.get_reflection(dateString, forUserId).subscribe((response) => {
      if (response.success) {
        this.$reflection.set(response.data);
        console.log('Reflection:', response.data);
        // If this day has no intention yet, fetch the previous day's to carry it forward
        if (!response.data?.intention) {
          const date = new Date(this.progressService.$dailyProgressDate());
          date.setDate(date.getDate() - 1);
          const prevDateString = toLocalDateString(date);
          this.get_reflection(prevDateString, forUserId).subscribe((prev) => {
            if (prev.success && prev.data?.intention) {
              this.$previousDayIntention.set(prev.data.intention);
            }
          });
        }
      }
    });
  });


  // forStats

  triggerLoadReflectionStats = effect(() => {
    this.loadReflectionStats();
  });


  loadReflectionStats = async () => {
    const { startDate, endDate } = this.statsService.$progressDateRange();
    const forUserId = this.upliftersService.$isViewingUplifter()
      ? this.upliftersService.$activeProfileId()
      : undefined;

    this.get_reflection_stats(startDate, endDate, forUserId).subscribe((response) => {
      if (response.success) {
        this.$reflectionStats.set(response.data);
        console.log('Reflection Stats:', response.data);
      }
    });
  }


  
  setIntention = (userIntention: string) => {
    if (!this.$reflection()) {
      console.error('No reflection available to set intention');
      return;
    }
    this.$reflection()!.intention = userIntention;
    this.$previousDayIntention.set(null);
  }


  // __________ HTTP REQUESTS __________

  get_reflection(dateStringWithoutTime: string, forUserId?: string) {
    let params = new HttpParams().set('date', dateStringWithoutTime);
    if (forUserId) params = params.set('forUserId', forUserId);

    return this.#http.get<StandardResponse<Reflection>>(
      environment.SERVER_URL + '/reflections',
      { params }
    );
  }

  put_reflection(reflection: Reflection) {
    return this.#http.put<StandardResponse<number>>(
      environment.SERVER_URL + '/reflections' + '/' + reflection._id,
      reflection
    );
  }


  get_reflection_stats(startDate: Date, endDate: Date, forUserId?: string) {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    if (forUserId) params = params.set('forUserId', forUserId);

    return this.#http.get<StandardResponse<StatBase>>(
      environment.SERVER_URL + '/reflections/stats',
      { params }
    );
  }
}
