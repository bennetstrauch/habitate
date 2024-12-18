import { Routes } from '@angular/router';

import { HabitsComponent } from '../../habits/habits.component';
import { GoalComponent } from '../goal.component';

export const goalRoutes: Routes = [
    { path: '', component: GoalComponent },
    { path: 'habits', 
        loadChildren: () => import('../../habits/habits.routes').then(r => r.habitsRoutes),
    },
]