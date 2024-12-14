import { effect, Injectable, signal } from '@angular/core';

export type GlobalState = {
  name: string,
  email: string,
  _id: string,
  jwtToken: string
}

export const intitialState : GlobalState = {
  name: '',
  email: '',
  _id: '',
  jwtToken: ''
}


@Injectable({
  providedIn: 'root'
})
export class StateService {

  $state = signal<GlobalState>(intitialState)

  myeffect = effect(() => {
    localStorage.setItem('HABITATE_APP_STATE', JSON.stringify(this.$state()));
  });


  isLoggedIn() {
    return this.$state()._id ? true : false;
  }

}
