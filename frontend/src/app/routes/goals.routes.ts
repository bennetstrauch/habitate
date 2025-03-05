import { Routes } from '@angular/router';
import { OverviewComponent } from '../goals/overview.component';
import { AddGoalComponent } from '../goals/add/addGoal.component';
import { SetupFirstGoalComponent } from '../goals/setupFirstGoal/setupFirstGoal.component';
import { inject } from '@angular/core';
import { StateService } from '../state.service';
import { GoalComponent } from '../goals/goal.component';
import { ReflectionComponent } from '../reflections/reflection';
import { addGoalGuard } from './resolver and guards/addGoal.guard';
import { noGoalGuard } from './resolver and guards/noGoal.guard';

export const goalsRoutes: Routes = [
  // replace with goalscomponent ##
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  {
    path: 'overview',
    component: OverviewComponent,
    // canActivate: [noGoalGuard]
  },
  { path: 'reflection/:date', component: ReflectionComponent },

  {
    path: 'add',
    loadComponent: () =>
      import('../goals/add/addGoal.component').then((c) => c.AddGoalComponent),
    canActivate: [addGoalGuard],
  },
  {
    path: 'setup',
    loadComponent: () =>
      import('../goals/setupFirstGoal/setupFirstGoal.component').then(
        (c) => c.SetupFirstGoalComponent
      ),
  },

  {
    path: 'habits',
    loadChildren: () => import('./habits.routes').then((r) => r.habitsRoutes),
  },
  {
    path: ':_id',
    loadChildren: () => import('./goal.routes').then((r) => r.goalRoutes),
  },
];
