import { Component, inject } from '@angular/core';
import { intitialState, StateService } from '../state.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-authentication',
  imports: [RouterLink, MatButton],
  template: `

    @if (!stateService.isLoggedIn()) {

      @if (router.url.includes('login')){
        <button mat-button color="primary" [routerLink]= "['', 'register']"> 
          Register </button>

      } @else {
      <button mat-button color="accent" [routerLink]= "['', 'login']"> 
        Login </button>
    }
    
  } @else {
    <button mat-raised-button color="warn" (click)='logout()' > 
      Logout </button>
  } 

  `,
  styles: `
    button{
      border-radius: 0px;
    }
  `
})
export class AuthenticationComponent {
  stateService = inject(StateService)
  router = inject(Router)

  logout() {
    this.stateService.$state.set(intitialState)
    this.router.navigate(['', 'login'])
  }
}
