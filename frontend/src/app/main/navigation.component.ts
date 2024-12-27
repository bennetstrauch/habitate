import { Component, inject } from '@angular/core';
import { intitialState, StateService } from '../state.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AuthenticationComponent } from "./authentication.component";
import { GoalsService } from '../goals/goals.service';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, MatButton, MatIcon, AuthenticationComponent],
  template: `
    <div class="nav-div">

    <app-authentication />

    @if (stateService.isLoggedIn()) {
      <!-- ## home should be in middle of button -->
        <button mat-button color="primary" [routerLink]= "['', 'goals', 'overview']"> 
          <mat-icon>home</mat-icon>
        </button>
    
        <!-- not hardcode length ## -->
        <button mat-button color="accent" [disabled]='goalsService.$goals().length >= 3' [routerLink]= "['', 'goals', 'add']"> 
          Add </button>
    } 

  </div>
  `,
  // unified css ##
  styles: `
    button{
      border-radius: 0px;
    }
  .nav-div {
    display: flex;
    justify-content: space-between;
  }
  `
})
export class NavigationComponent {
  stateService = inject(StateService)
  router = inject(Router)
  goalsService = inject(GoalsService)

  logout() {
    this.stateService.$state.set(intitialState)
    this.router.navigate(['', 'login'])
  }
}
