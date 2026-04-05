import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { SuggestionReply } from '@backend/suggestion-replies/suggestion-replies.types';
import { environment } from 'frontend/src/environments/environment';
import { StateService } from '../state.service';

export type { SuggestionReply };

@Injectable({ providedIn: 'root' })
export class SuggestionRepliesService {
  #http = inject(HttpClient);
  #stateService = inject(StateService);

  $unseenReplies = signal<SuggestionReply[]>([]);

  constructor() {
    effect(() => {
      if (this.#stateService.isLoggedIn()) {
        this.loadUnseen();
      }
    });
  }

  loadUnseen() {
    this.#http
      .get<StandardResponse<SuggestionReply[]>>(environment.SERVER_URL + '/suggestion-replies/unseen')
      .subscribe(r => { if (r.success) this.$unseenReplies.set(r.data); });
  }

  postReply(suggestion_id: string, text: string) {
    return this.#http.post<StandardResponse<SuggestionReply>>(
      environment.SERVER_URL + '/suggestion-replies',
      { suggestion_id, text }
    );
  }

  markSeen(ids: string[]) {
    this.#http
      .patch<StandardResponse<null>>(environment.SERVER_URL + '/suggestion-replies/mark-seen', { ids })
      .subscribe(() => this.$unseenReplies.set([]));
  }
}
