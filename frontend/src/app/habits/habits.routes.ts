import { Routes } from '@angular/router';
import { OverviewComponent } from '../goals/overview.component';
import { AddGoalComponent } from '../goals/add/addGoal.component';
import { SetupFirstGoalComponent } from '../goals/setupFirstGoal/setupFirstGoal.component';
import { HabitsComponent } from './habits.component';
import { AddHabitComponent } from './addHabit.component';
import { AddHelpComponent } from './addHelp.component';

export const habitsRoutes: Routes = [
    { path: '', component: HabitsComponent },
    { path: 'add', 
        loadChildren: () => addHabitRoutes
    },

]

export const addHabitRoutes: Routes = [
    { path: '', component: AddHabitComponent},
    { path: 'help', component: AddHelpComponent},
]
