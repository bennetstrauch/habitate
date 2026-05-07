import { HttpClient, HttpParams } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { Comment, UnseenDateEntry } from '@backend/comments/comments.types';
import { environment } from 'frontend/src/environments/environment';
import { ProgressService } from '../progresses/progresses.service';
import { toLocalDateString } from '../utils/utils';

export type { Comment, UnseenDateEntry };

@Injectable({ providedIn: 'root' })
export class CommentsService {
  #http = inject(HttpClient);
  #progressService = inject(ProgressService);

  $comments = signal<Comment[]>([]);
  $datesWithUnseenComments = signal<UnseenDateEntry[]>([]);

  #seenTimer: ReturnType<typeof setTimeout> | null = null;
  #markNextLoadImmediately = false;

  constructor() {
    effect(() => {
      const date = toLocalDateString(this.#progressService.$dailyProgressDate());
      if (this.#seenTimer) clearTimeout(this.#seenTimer);
      this.loadComments(date);
    });

    this.loadUnseenDates();
  }

  markSeenImmediatelyOnNextLoad() {
    this.#markNextLoadImmediately = true;
  }

  loadComments(date: string) {
    const immediate = this.#markNextLoadImmediately;
    this.#markNextLoadImmediately = false;

    const params = new HttpParams().set('date', date);
    this.#http
      .get<StandardResponse<Comment[]>>(environment.SERVER_URL + '/comments', { params })
      .subscribe(r => {
        if (!r.success) return;
        this.$comments.set(r.data);
        const unseenIds = r.data.filter(c => !c.seen).map(c => c._id);
        if (unseenIds.length === 0) return;
        if (immediate) {
          this.#patchSeen(unseenIds, date);
        } else {
          this.#seenTimer = setTimeout(() => this.#patchSeen(unseenIds, date), 3000);
        }
      });
  }

  #patchSeen(unseenIds: string[], date: string) {
    this.#http
      .patch<StandardResponse<null>>(environment.SERVER_URL + '/comments/mark-seen', { ids: unseenIds })
      .subscribe({
        next: () => this.$datesWithUnseenComments.update(es => es.filter(e => e.date !== date)),
        error: () => {},
      });
  }

  loadUnseenDates() {
    this.#http
      .get<StandardResponse<UnseenDateEntry[]>>(environment.SERVER_URL + '/comments/unseen-dates')
      .subscribe(r => { if (r.success) this.$datesWithUnseenComments.set(r.data); });
  }

  postComment(payload: {
    to_user_id: string;
    habit_id: string;
    habit_name: string;
    date: string;
    text: string;
  }) {
    return this.#http.post<StandardResponse<Comment>>(environment.SERVER_URL + '/comments', payload);
  }

  getCommentCounts(date: string, friendIds: string[]) {
    const params = new HttpParams()
      .set('date', date)
      .set('friend_ids', friendIds.join(','));
    return this.#http.get<StandardResponse<Record<string, number>>>(
      environment.SERVER_URL + '/comments/counts',
      { params }
    );
  }

  deleteComment(id: string) {
    return this.#http.delete<StandardResponse<null>>(environment.SERVER_URL + '/comments/' + id);
  }
}
