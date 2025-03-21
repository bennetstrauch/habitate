import { effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getTimezone } from './utils/utils';

export type GlobalState = {
  name: string;
  email: string;
  _id: string;
  jwtToken: string;
};

export const intitialState: GlobalState = {
  name: '',
  email: '',
  _id: '',
  jwtToken: '',
};

@Injectable({
  providedIn: 'root',
})
export class StateService {
  #router = inject(Router);

  $state = signal<GlobalState>(intitialState);

  myeffect = effect(() => {
    localStorage.setItem('HABITATE_APP_STATE', JSON.stringify(this.$state()));
  });

  isLoggedIn() {
    return this.$state()._id ? true : false;
  }

  // ##refactor
  logout() {
    this.$state.set(intitialState);
    this.#router.navigate(['', 'login']);
  }
}
