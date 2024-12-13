import { Injectable, signal } from '@angular/core';

export type GlobalState = {
  username: string,
  email: string,
  _id: string,
  jwtToken: string
}

export const intitialState = {
  username: '',
  email: '',
  _id: '',
  jwtToken: ''
}


@Injectable({
  providedIn: 'root'
})
export class StateService {

  $state = signal<GlobalState>(intitialState)

}
