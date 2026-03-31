import { Component, inject, OnInit } from '@angular/core';
import { intitialState, StateService } from '../state.service';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AuthenticationButtonComponent } from '../users/authentication.component';
import { GoalsService } from '../goals/goals.service';
import { validationRulesGoals } from '@global/auth/validationRules';
import { MatMenuModule } from '@angular/material/menu';
import { ProgressService } from '../progresses/progresses.service';
import { JoyrideModule } from 'ngx-joyride';
import { UpliftersService } from '../uplifters/uplifters.service';

@Component({
  selector: 'app-navigation',
  imports: [
    RouterLink,
    MatButton,
    MatIcon,
    AuthenticationButtonComponent,
    MatMenuModule,
    JoyrideModule,
  ],
  template: `
    <div class="nav-div">
      @if (!stateService.isLoggedIn()) {
      <app-authentication-button />
      } @if (stateService.isLoggedIn()) {

      <button mat-button [matMenuTriggerFor]="menu">
        <mat-icon>menu</mat-icon>
      </button>

      <button
        mat-button
        color="primary"
        [routerLink]="['', 'goals', 'overview']"
        [disabled]="isOverviewActive()"
      >
        <mat-icon>home</mat-icon>
      </button>

      <button
        mat-button
        color="primary"
        (click)="toggleStatsButton()"
        [disabled]="!isOverviewActive()"
      >
        @if (progressService.$displayDailyProgress()) {
        <mat-icon
          joyrideStep="toggleView"
          title="Change View"
          text="Click here to switch between Daily Progress and Weekly Overview."
          >bar_chart</mat-icon
        >
        } @else {
        <mat-icon>task_alt</mat-icon>
        }
      </button>

      <!-- Profile switcher: Me + each uplifter -->
      @if (upliftersService.$connections().length > 0) {
      <div class="profile-switcher">
        <button
          mat-button
          [class.active-profile]="!upliftersService.$isViewingUplifter()"
          (click)="switchProfile('')"
        >Me</button>
        @for (c of upliftersService.$connections(); track c._id) {
        <button
          mat-button
          [class.active-profile]="upliftersService.$activeProfileId() === c._id"
          (click)="switchProfile(c._id)"
        >{{ c.name }}</button>
        }
      </div>
      }

      <!-- Dropdown Menu -->
      <mat-menu #menu="matMenu">
        @if (!upliftersService.$isViewingUplifter()) {
        <button
          mat-menu-item
          [disabled]="
            goalsService.$goals().length >= validationRulesGoals.maxLength
            || goalsService.$habitIds().length == 0
          "
          [routerLink]="['', 'goals', 'add']"
        >
          Add Goal
        </button>
        }

        <button mat-menu-item [routerLink]="['', 'user-details']">
          My Profile
        </button>

        <button mat-menu-item color="warn" (click)="stateService.logout()">
          Logout
        </button>
      </mat-menu>
      }
    </div>
  `,
  styles: `
    button {
      border-radius: 0px;
    }
    .nav-div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    .profile-switcher {
      display: flex;
      gap: 2px;
    }
    .active-profile {
      font-weight: bold;
      text-decoration: underline;
    }
  `,
})
export class NavigationComponent implements OnInit {
  readonly stateService = inject(StateService);
  readonly progressService = inject(ProgressService);
  readonly goalsService = inject(GoalsService);
  readonly upliftersService = inject(UpliftersService);

  router = inject(Router);
  validationRulesGoals = validationRulesGoals;

  ngOnInit() {
    if (this.stateService.isLoggedIn()) {
      this.upliftersService.loadConnections().subscribe();
    }
  }

  switchProfile(userId: string) {
    this.upliftersService.$activeProfileId.set(userId);
    this.goalsService.update_goals();
  }

  logout() {
    this.stateService.$state.set(intitialState);
    this.router.navigate(['', 'login']);
  }

  toggleStatsButton() {
    this.progressService.$displayStats.set(
      !this.progressService.$displayStats()
    );
  }

  isOverviewActive(): boolean {
    return this.router.url.includes('overview');
  }
}
