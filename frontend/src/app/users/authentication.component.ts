import { Component, inject } from '@angular/core';
import { intitialState, StateService } from '../state.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-authentication-button',
  imports: [RouterLink, MatButton],
  template: `
    @if (router.url.includes('login')){
    <button mat-button color="primary" [routerLink]="['', 'register']">
      Register
    </button>

    } @else {
    <button mat-button color="accent" [routerLink]="['', 'login']">
      Login
    </button>
    }
  `,
  styles: `
    button{
      border-radius: 0px;
    }
  `,
})
export class AuthenticationButtonComponent {
  router = inject(Router);
  stateService = inject(StateService);
}
