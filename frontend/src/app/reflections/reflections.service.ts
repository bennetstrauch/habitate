import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, forkJoin, map, of, switchMap, tap } from 'rxjs';
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
  $weeklyReflections = signal<Reflection[]>([]);

  constructor() {
    // ── Daily reflection: auto-cancels in-flight request when date or profile changes ──
    const $dailyCtx = computed(() => ({
      dateString: toLocalDateString(this.progressService.$dailyProgressDate()),
      forUserId: this.upliftersService.$isViewingUplifter()
        ? this.upliftersService.$activeProfileId()
        : undefined,
    }));

    toObservable($dailyCtx).pipe(
      distinctUntilChanged((a, b) => a.dateString === b.dateString && a.forUserId === b.forUserId),
      tap(() => this.$previousDayIntention.set(null)),
      switchMap(({ dateString, forUserId }) =>
        this.get_reflection(dateString, forUserId).pipe(
          switchMap(response => {
            if (!response.success || response.data?.intention) {
              return of({ main: response, prev: null as typeof response | null });
            }
            // No intention yet — fetch previous day's to carry it forward
            const [y, m, d] = dateString.split('-').map(Number);
            const prevDateString = toLocalDateString(new Date(y, m - 1, d - 1));
            return this.get_reflection(prevDateString, forUserId).pipe(
              map(prev => ({ main: response, prev }))
            );
          })
        )
      ),
      takeUntilDestroyed()
    ).subscribe(({ main, prev }) => {
      if (main.success) this.$reflection.set(main.data);
      if (prev?.success && prev.data?.intention) this.$previousDayIntention.set(prev.data.intention);
    });

    // ── Stats + weekly reflections: auto-cancels in-flight requests on context change ──
    const $statsCtx = computed(() => ({
      ...this.statsService.$progressDateRange(),
      forUserId: this.upliftersService.$isViewingUplifter()
        ? this.upliftersService.$activeProfileId()
        : undefined,
    }));

    toObservable($statsCtx).pipe(
      distinctUntilChanged((a, b) =>
        a.startDate.getTime() === b.startDate.getTime() &&
        a.endDate.getTime() === b.endDate.getTime() &&
        a.forUserId === b.forUserId
      ),
      switchMap(({ startDate, endDate, forUserId }) =>
        forkJoin([
          this.get_reflection_stats(startDate, endDate, forUserId),
          this.get_reflections_for_range(startDate, endDate, forUserId),
        ])
      ),
      takeUntilDestroyed()
    ).subscribe(([stats, weekly]) => {
      if (stats.success) this.$reflectionStats.set(stats.data);
      if (weekly.success) this.$weeklyReflections.set(weekly.data);
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

  // Imperative refresh — called after completing a reflection
  loadReflectionStats() {
    const { startDate, endDate } = this.statsService.$progressDateRange();
    const forUserId = this.upliftersService.$isViewingUplifter()
      ? this.upliftersService.$activeProfileId()
      : undefined;

    forkJoin([
      this.get_reflection_stats(startDate, endDate, forUserId),
      this.get_reflections_for_range(startDate, endDate, forUserId),
    ]).subscribe(([stats, weekly]) => {
      if (stats.success) this.$reflectionStats.set(stats.data);
      if (weekly.success) this.$weeklyReflections.set(weekly.data);
    });
  }


  // ── HTTP ──

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

  get_reflections_for_range(startDate: Date, endDate: Date, forUserId?: string) {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    if (forUserId) params = params.set('forUserId', forUserId);
    return this.#http.get<StandardResponse<Reflection[]>>(
      environment.SERVER_URL + '/reflections/range',
      { params }
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
