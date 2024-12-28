import { Routes } from '@angular/router';
import { OverviewComponent } from '../overview.component';
import { AddGoalComponent } from '../add/addGoal.component';
import { SetupFirstGoalComponent } from '../setupFirstGoal/setupFirstGoal.component';
import { inject } from '@angular/core';
import { StateService } from '../../state.service';
import { GoalComponent } from '../goal.component';
import { ReflectionComponent } from '../reflection';
import { addGoalGuard } from '../../main/addGoal.guard';

export const goalsRoutes: Routes = [
    // replace with goalscomponent ##
    { path: '', redirectTo: 'overview' , pathMatch: 'full'},
    { path: 'overview', component: OverviewComponent },
    { path: 'reflection', component: ReflectionComponent },

    { path: 'add', 
        loadComponent: () => import('../add/addGoal.component').then(c => c.AddGoalComponent),
        canActivate: [addGoalGuard]
    },
    { path: 'setup', loadComponent: () => import('../setupFirstGoal/setupFirstGoal.component').then(c => c.SetupFirstGoalComponent) },

    { path: 'habits', 
        loadChildren: () => import('../../habits/habits.routes').then(r => r.habitsRoutes),
    },
    { path: ':_id', 
        loadChildren: () => import('./goal.routes').then(r => r.goalRoutes),
    },

    
]