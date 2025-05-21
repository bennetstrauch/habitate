import { Routes } from '@angular/router';

import { HabitsComponent } from '../habits/habits.component';
import { GoalComponent } from '../goals/goal.component';
import { UpdateGoalComponent } from '../goals/updateGoal.component';

export const goalRoutes: Routes = [
  { path: '', component: GoalComponent },
  {
    path: 'habits',
    loadChildren: () => import('./habits.routes').then((r) => r.habitsRoutes),
  },
  { path: 'update', component: UpdateGoalComponent },
];
