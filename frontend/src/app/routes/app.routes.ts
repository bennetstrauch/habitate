import { Routes } from '@angular/router';
import { LoginComponent } from '../users/login.component';
import { inject } from '@angular/core';
import { StateService } from '../state.service';
import { WelcomeComponent } from '../goals/getStarted/welcome.component';
import { GoalsResolver } from './resolver and guards/goals.resolver';
import { stateGuard } from './resolver and guards/state.guard';
import { Step4_2Reminder } from '../users/register/step4-2-reminder';

// # global variables for routes

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  // ##loadComponent
  { path: 'welcome', component: WelcomeComponent, canActivate: [stateGuard] },
  { path: 'login', component: LoginComponent, canActivate: [stateGuard] },
  {
    path: 'register',
    loadComponent: () =>
      import('../users/register/register.component').then(
        (c) => c.RegisterComponent
      ),
    canActivate: [stateGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('../users/resetPassword/reset-password-request.component').then(
        (c) => c.ResetPasswordRequestComponent
      ),
    canActivate: [stateGuard],
  },
  {
    path: 'set-new-password',
    loadComponent: () =>
      import('../users/resetPassword/set-new-password.component').then(
        (c) => c.SetNewPasswordComponent
      ),
    // # needed? also in other pw route
    canActivate: [stateGuard],
  },

  {
    path: 'goals',
    loadChildren: () => import('./goals.routes').then((r) => r.goalsRoutes),
    canActivate: [() => inject(StateService).isLoggedIn()],
    resolve: {
      goals: GoalsResolver,
    },
  },
  {
    path: 'user-details',
    loadComponent: () =>
      import('../users/edit-user-details.component').then(
        (c) => c.EditUserDetailsComponent
      ),
    canActivate: [() => inject(StateService).isLoggedIn()],
  }
];
