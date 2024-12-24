import { Component, inject } from '@angular/core';
import { intitialState, StateService } from '../state.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AuthenticationComponent } from "./authentication.component";

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, MatButton, MatIcon, AuthenticationComponent],
  template: `


    <app-authentication />

    @if (stateService.isLoggedIn()) {

      <!-- ## home should be in middle of button -->
        <button mat-button color="primary" [routerLink]= "['', 'overview']"> 
          <mat-icon>home</mat-icon>
        </button>

    
        <button mat-button color="accent" [routerLink]= "['', 'modify', 'goals']"> 
          Modify </button>
    
    
  } 
  `,
  // unified css ##
  styles: `
    button{
      border-radius: 0px;
    }
  `
})
export class NavigationComponent {
  stateService = inject(StateService)
  router = inject(Router)

  logout() {
    this.stateService.$state.set(intitialState)
    this.router.navigate(['', 'login'])
  }
}
