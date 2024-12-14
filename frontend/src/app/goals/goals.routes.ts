import { Routes } from '@angular/router';
import { GoalsComponent } from './goals.component';
import { AddGoalComponent } from './addGoal.component';

export const goalsRoutes: Routes = [
    { path: '', component: GoalsComponent },
    { path: 'add', component: AddGoalComponent}
]