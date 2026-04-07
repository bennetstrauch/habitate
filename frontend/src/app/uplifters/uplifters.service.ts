import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { StandardResponse } from '@backend/types/standardResponse';
import { environment } from 'frontend/src/environments/environment';
import { StateService } from '../state.service';

export interface Uplifter {
  _id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UpliftersService {
  #http = inject(HttpClient);
  #stateService = inject(StateService);

  $connections = signal<Uplifter[]>([]);
  $activeProfileId = signal<string>('');

  $isViewingUplifter = computed(() => {
    const activeId = this.$activeProfileId();
    const ownId = this.#stateService.$state()._id;
    return !!activeId && !!ownId && activeId !== ownId;
  });

  $activeProfileName = computed(() =>
    this.$isViewingUplifter()
      ? (this.$connections().find(c => c._id === this.$activeProfileId())?.name ?? '')
      : 'Me'
  );

  constructor() {
    effect(() => {
      if (!this.#stateService.$state()._id) {
        this.$connections.set([]);
        this.$activeProfileId.set('');
      }
    });
  }

  loadConnections() {
    return this.#http
      .get<StandardResponse<Uplifter[]>>(environment.SERVER_URL + '/users/connections')
      .pipe(tap(r => { if (r.success) this.$connections.set(r.data); }));
  }

  getInviteCode() {
    return this.#http.get<StandardResponse<{ inviteCode: string }>>(
      environment.SERVER_URL + '/users/me/invite-code'
    );
  }

  regenerateInviteCode() {
    return this.#http.post<StandardResponse<{ inviteCode: string }>>(
      environment.SERVER_URL + '/users/me/invite-code/regenerate',
      {}
    );
  }

  connect(code: string) {
    return this.#http
      .post<StandardResponse<Uplifter>>(environment.SERVER_URL + '/users/connect', { code })
      .pipe(tap(r => { if (r.success) this.$connections.update(cs => [...cs, r.data]); }));
  }

  removeConnection(friendId: string) {
    return this.#http
      .delete<StandardResponse<null>>(
        environment.SERVER_URL + '/users/connections/' + friendId
      )
      .pipe(
        tap(r => {
          if (r.success) {
            this.$connections.update(cs => cs.filter(c => c._id !== friendId));
            if (this.$activeProfileId() === friendId) this.$activeProfileId.set('');
          }
        })
      );
  }

  $upliftersTourSeen = signal(localStorage.getItem('HABITATE_UPLIFTERS_TOUR_SEEN') === 'true');

  markUpliftersTourSeen() {
    localStorage.setItem('HABITATE_UPLIFTERS_TOUR_SEEN', 'true');
    this.$upliftersTourSeen.set(true);
  }
}
