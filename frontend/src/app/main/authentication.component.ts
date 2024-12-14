import { Component, inject } from '@angular/core';
import { intitialState, StateService } from '../state.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-authentication',
  imports: [RouterLink],
  template: `
  
    @if (!stateService.isLoggedIn()) {
      <a [routerLink]= "['', 'login']"> Login </a>
      <a [routerLink]= "['', 'register']"> Register </a>

  } @else {
    <button (click)='logout()' > Logout </button>
  } 

  `,
  styles: ``
})
export class AuthenticationComponent {
  stateService = inject(StateService)
  #router = inject(Router)

  logout() {
    this.stateService.$state.set(intitialState)
    this.#router.navigate(['', 'login'])
  }
}
