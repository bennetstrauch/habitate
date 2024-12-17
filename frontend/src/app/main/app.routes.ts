import { Routes } from '@angular/router';
import { LoginComponent } from '../users/login.component';
import { inject } from '@angular/core';
import { StateService } from '../state.service';
import { WelcomeComponent } from '../goals/getStarted/welcome.component';
import { RegisterStepOneComponent } from '../users/register/step1';

// # global variables for routes

export const routes: Routes = [
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: 'welcome', component: WelcomeComponent},
    { path: 'step1', component: RegisterStepOneComponent},
    { path: 'login', component: LoginComponent },
    { path: 'register', loadComponent: () => import('../users/register/register.component').then(c => c.RegisterComponent) },
    { path: 'goals', 
        loadChildren: () => import('../goals/goals.routes').then(r => r.goalsRoutes),
        canActivate: [ () => inject(StateService).isLoggedIn() ]

    },
    { path: 'habits', 
        loadChildren: () => import('../habits/habits.routes').then(r => r.habitsRoutes),
        canActivate: [ () => inject(StateService).isLoggedIn() ]

    }

];
