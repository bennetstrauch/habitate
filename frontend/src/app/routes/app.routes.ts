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
      import('../users/reset-password.component').then(
        (c) => c.ResetPasswordComponent
      ),
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
  //   { path: 'test-reg', component: Step4_2Reminder },
];
