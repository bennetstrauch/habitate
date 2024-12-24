import { Routes } from '@angular/router';
import { OverviewComponent } from '../../main/overview.component';
import { AddGoalComponent } from '../add/addGoal.component';
import { SetupFirstGoalComponent } from '../setupFirstGoal/setupFirstGoal.component';
import { inject } from '@angular/core';
import { StateService } from '../../state.service';
import { GoalComponent } from '../goal.component';

export const goalsRoutes: Routes = [
    // replace with goalscomponent ##
    { path: '', component: OverviewComponent, 

     },
    { path: 'add', component: AddGoalComponent},
    { path: 'setup', component: SetupFirstGoalComponent},
    { path: 'habits', 
        loadChildren: () => import('../../habits/habits.routes').then(r => r.habitsRoutes),
    },
    { path: ':_id', 
        loadChildren: () => import('./goal.routes').then(r => r.goalRoutes),
    },

    
]