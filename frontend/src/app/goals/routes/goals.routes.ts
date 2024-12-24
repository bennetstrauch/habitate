import { Routes } from '@angular/router';
import { OverviewComponent } from '../overview.component';
import { AddGoalComponent } from '../add/addGoal.component';
import { SetupFirstGoalComponent } from '../setupFirstGoal/setupFirstGoal.component';
import { inject } from '@angular/core';
import { StateService } from '../../state.service';
import { GoalComponent } from '../goal.component';

export const goalsRoutes: Routes = [
    // replace with goalscomponent ##
    { path: '', redirectTo: 'overview' , pathMatch: 'full'},
    { path: 'overview', component: OverviewComponent },

    { path: 'add', loadComponent: () => import('../add/addGoal.component').then(c => c.AddGoalComponent) },
    { path: 'setup', loadComponent: () => import('../setupFirstGoal/setupFirstGoal.component').then(c => c.SetupFirstGoalComponent) },

    { path: 'habits', 
        loadChildren: () => import('../../habits/habits.routes').then(r => r.habitsRoutes),
    },
    { path: ':_id', 
        loadChildren: () => import('./goal.routes').then(r => r.goalRoutes),
    },

    
]