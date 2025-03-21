import { Routes } from '@angular/router';
import { OverviewComponent } from '../goals/overview.component';
import { AddGoalComponent } from '../goals/add/addGoal.component';
import { SetupFirstGoalComponent } from '../goals/setupFirstGoal/setupFirstGoal.component';
import { HabitsComponent } from '../habits/habits.component';
import { AddHabitComponent } from '../habits/addHabit.component';
import { AddHelpComponent } from '../habits/addHelp.component';
import { UpdateHabitComponent } from '../habits/updateHabit.component';

export const habitsRoutes: Routes = [
  { path: '', component: HabitsComponent },
  { path: 'add', loadChildren: () => addHabitRoutes },
  { path: ':habit_id', loadChildren: () => habitRoutes },
];

export const addHabitRoutes: Routes = [
  { path: '', component: AddHabitComponent },
  { path: 'help', component: AddHelpComponent },
];

export const habitRoutes: Routes = [
  { path: 'update', component: UpdateHabitComponent },
];
