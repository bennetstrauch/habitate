import { Routes } from '@angular/router';
import { GoalsComponent } from '../goals.component';
import { AddGoalComponent } from '../add/addGoal.component';
import { SetupFirstGoalComponent } from '../setupFirstGoal/setupFirstGoal.component';
import { inject } from '@angular/core';
import { StateService } from '../../state.service';
import { GoalComponent } from '../goal.component';

export const goalsRoutes: Routes = [
    { path: '', component: GoalsComponent, 

     },
    { path: 'add', component: AddGoalComponent},
    { path: 'setup', component: SetupFirstGoalComponent},
    { path: 'habits', 
        loadChildren: () => import('../../habits/habits.routes').then(r => r.habitsRoutes),
    },
    { path: ':id', 
        loadChildren: () => import('./goal.routes').then(r => r.goalRoutes),
    },

    
]