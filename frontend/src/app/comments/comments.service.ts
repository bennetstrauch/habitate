import { HttpClient, HttpParams } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { Comment } from '@backend/comments/comments.types';
import { environment } from 'frontend/src/environments/environment';
import { ProgressService } from '../progresses/progresses.service';
import { toLocalDateString } from '../utils/utils';

export type { Comment };

@Injectable({ providedIn: 'root' })
export class CommentsService {
  #http = inject(HttpClient);
  #progressService = inject(ProgressService);

  $comments = signal<Comment[]>([]);

  constructor() {
    effect(() => {
      const date = toLocalDateString(this.#progressService.$dailyProgressDate());
      this.loadComments(date);
    });
  }

  loadComments(date: string) {
    const params = new HttpParams().set('date', date);
    this.#http
      .get<StandardResponse<Comment[]>>(environment.SERVER_URL + '/comments', { params })
      .subscribe(r => { if (r.success) this.$comments.set(r.data); });
  }

  postComment(payload: {
    to_user_id: string;
    habit_id: string;
    habit_name: string;
    date: string;
    text: string;
  }) {
    return this.#http.post<StandardResponse<Comment>>(
      environment.SERVER_URL + '/comments',
      payload
    );
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
    return this.#http
      .delete<StandardResponse<null>>(environment.SERVER_URL + '/comments/' + id)
      .pipe();
  }
}
