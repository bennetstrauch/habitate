import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { StandardResponse } from '@backend/types/standardResponse';
import { ActivitySuggestion } from '@backend/suggestions/suggestions.types';
import { environment } from 'frontend/src/environments/environment';
import { toLocalDateString } from '../utils/utils';

@Injectable({ providedIn: 'root' })
export class SuggestionsService {
  #http = inject(HttpClient);

  $pendingSuggestions = signal<ActivitySuggestion[]>([]);
  $acceptedSuggestions = signal<ActivitySuggestion[]>([]);
  $viewedAcceptedSuggestion = signal<ActivitySuggestion | null>(null);
  $hasSent = signal(false);
  /** ID of the accepted suggestion whose goal is being reassigned, or null */
  $goalPickerForId = signal<string | null>(null);

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

  acceptForTomorrow(id: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const displayDate = toLocalDateString(tomorrow);
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

  loadAcceptedForUser(forUserId: string, date: string) {
    this.#http
      .get<StandardResponse<ActivitySuggestion[]>>(
        environment.SERVER_URL + '/suggestions',
        { params: { date, forUserId } }
      )
      .subscribe((r) => {
        if (r.success) this.$viewedAcceptedSuggestion.set(r.data[0] ?? null);
      });
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
