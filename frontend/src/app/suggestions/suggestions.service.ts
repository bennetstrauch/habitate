import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StandardResponse } from '@backend/types/standardResponse';
import { ActivitySuggestion } from '@backend/suggestions/suggestions.types';
import { environment } from 'frontend/src/environments/environment';
import { toLocalDateString } from '../utils/utils';
import { UpliftersService } from '../uplifters/uplifters.service';
import { ProgressService } from '../progresses/progresses.service';

@Injectable({ providedIn: 'root' })
export class SuggestionsService {
  #http = inject(HttpClient);
  #upliftersService = inject(UpliftersService);
  #progressService = inject(ProgressService);

  $pendingSuggestions = signal<ActivitySuggestion[]>([]);
  $acceptedSuggestions = signal<ActivitySuggestion[]>([]);
  $viewedAcceptedSuggestions = signal<ActivitySuggestion[]>([]);
  $hasSent = signal(false);
  /** ID of the accepted suggestion whose goal is being reassigned, or null */
  $goalPickerForId = signal<string | null>(null);

  constructor() {
    // Auto-loads the viewed person's accepted suggestion; cancels stale requests via switchMap
    const $ctx = computed(() => {
      if (!this.#upliftersService.$isViewingUplifter()) return null;
      return {
        forUserId: this.#upliftersService.$activeProfileId(),
        date: toLocalDateString(this.#progressService.$dailyProgressDate()),
      };
    });

    toObservable($ctx).pipe(
      distinctUntilChanged((a, b) => {
        if (a === null && b === null) return true;
        if (a === null || b === null) return false;
        return a.forUserId === b.forUserId && a.date === b.date;
      }),
      switchMap(ctx => {
        if (!ctx) return of(null);
        return this.#http.get<StandardResponse<ActivitySuggestion[]>>(
          environment.SERVER_URL + '/suggestions',
          { params: { date: ctx.date, forUserId: ctx.forUserId } }
        );
      }),
      takeUntilDestroyed()
    ).subscribe(r => {
      this.$viewedAcceptedSuggestions.set(r?.success ? r.data : []);
    });
  }

  loadReceivedForDate(date: string) {
    this.#http
      .get<StandardResponse<ActivitySuggestion[]>>(
        environment.SERVER_URL + '/suggestions',
        { params: { date } }
      )
      .subscribe((r) => {
        if (!r.success) return;
        this.$pendingSuggestions.set(r.data.filter((s) => s.status === 'pending'));
        this.$acceptedSuggestions.set(r.data.filter((s) => s.status === 'accepted'));
      });
  }

  checkSentToUser(to_user_id: string, date: string) {
    this.$hasSent.set(false);
    this.#http
      .get<StandardResponse<ActivitySuggestion | null>>(
        environment.SERVER_URL + '/suggestions/sent',
        { params: { to_user_id, date } }
      )
      .subscribe((r) => {
        if (r.success) this.$hasSent.set(!!r.data);
      });
  }

  post(to_user_id: string, date: string, text: string, goal_id: string | null) {
    return this.#http
      .post<StandardResponse<ActivitySuggestion>>(
        environment.SERVER_URL + '/suggestions',
        { to_user_id, date, text, goal_id }
      )
      .pipe(tap((r) => { if (r.success) this.$hasSent.set(true); }));
  }

  accept(id: string) {
    return this.#http
      .put<StandardResponse<ActivitySuggestion>>(
        environment.SERVER_URL + '/suggestions/' + id,
        { status: 'accepted' }
      )
      .pipe(
        tap((r) => {
          if (!r.success) return;
          this.$acceptedSuggestions.update((list) => [...list, r.data]);
          this.$pendingSuggestions.update((list) => list.filter((s) => s._id !== id));
        })
      );
  }

  acceptForTomorrow(id: string, suggestionDate: string) {
    const today = new Date();
    const todayStr = toLocalDateString(today);
    const suggestionDay = toLocalDateString(new Date(suggestionDate));
    let displayDate: string;
    if (todayStr > suggestionDay) {
      displayDate = todayStr;
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      displayDate = toLocalDateString(tomorrow);
    }
    return this.#http
      .put<StandardResponse<ActivitySuggestion>>(
        environment.SERVER_URL + '/suggestions/' + id,
        { status: 'accepted', display_date: displayDate }
      )
      .pipe(
        tap((r) => {
          if (r.success) this.$pendingSuggestions.update((list) => list.filter((s) => s._id !== id));
        })
      );
  }

  dismiss(id: string) {
    return this.#http
      .put<StandardResponse<ActivitySuggestion>>(
        environment.SERVER_URL + '/suggestions/' + id,
        { status: 'dismissed' }
      )
      .pipe(tap((r) => {
        if (r.success) this.$pendingSuggestions.update((list) => list.filter((s) => s._id !== id));
      }));
  }

  toggleCompleted(id: string, completed: boolean) {
    return this.#http
      .put<StandardResponse<ActivitySuggestion>>(
        environment.SERVER_URL + '/suggestions/' + id,
        { completed }
      )
      .pipe(tap((r) => {
        if (r.success) this.$acceptedSuggestions.update(
          (list) => list.map((s) => s._id === id ? r.data : s)
        );
      }));
  }

  changeGoal(id: string, goal_id: string | null) {
    return this.#http
      .put<StandardResponse<ActivitySuggestion>>(
        environment.SERVER_URL + '/suggestions/' + id,
        { goal_id }
      )
      .pipe(tap((r) => {
        if (r.success) this.$acceptedSuggestions.update(
          (list) => list.map((s) => s._id === id ? r.data : s)
        );
      }));
  }
}
