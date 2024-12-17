import { Routes } from '@angular/router';
import { GoalsComponent } from './goals.component';
import { AddGoalComponent } from './add/addGoal.component';
import { SetupFirstGoalComponent } from './setupFirstGoal/setupFirstGoal.component';

export const goalsRoutes: Routes = [
    { path: '', component: GoalsComponent },
    { path: 'add', component: AddGoalComponent},
    { path: 'setup', component: SetupFirstGoalComponent},
]