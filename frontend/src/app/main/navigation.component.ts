import { Component, inject } from '@angular/core';
import { intitialState, StateService } from '../state.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AuthenticationButtonComponent } from '../users/authentication.component';
import { GoalsService } from '../goals/goals.service';
import { validationRulesGoals } from '@global/auth/validationRules';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-navigation',
  imports: [
    RouterLink,
    MatButton,
    MatIcon,
    AuthenticationButtonComponent,
    MatMenuModule,
  ],
  template: `
    <div class="nav-div">
      @if (!stateService.isLoggedIn()) {
      <app-authentication-button />
      } @if (stateService.isLoggedIn()) {

        <!-- less padding for this one, so lines are bigger -->
      <button mat-button [matMenuTriggerFor]="menu">
        <mat-icon>menu</mat-icon>
      </button>


      <!-- ## home should be in middle of button -->
      <button
        mat-button
        color="primary"
        [routerLink]="['', 'goals', 'overview']"
      >
        <mat-icon>home</mat-icon>
      </button>

      <!-- Dropdown Menu -->
      <mat-menu #menu="matMenu">
        <button
          mat-menu-item
          [disabled]="goalsService.$goals().length >= validationRulesGoals.maxLength"
          [routerLink]="['', 'goals', 'add']">
          Add Goal </button>
    

        <button mat-menu-item color="warn" (click)="stateService.logout()">
          Logout
        </button>
      </mat-menu>

      <button mat-button color="accent" [routerLink]="['', 'goals', 'add']">
        Log
      </button>
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
  `,
})
export class NavigationComponent {
  stateService = inject(StateService);
  router = inject(Router);
  goalsService = inject(GoalsService);
  validationRulesGoals = validationRulesGoals;

  logout() {
    this.stateService.$state.set(intitialState);
    this.router.navigate(['', 'login']);
  }
}
