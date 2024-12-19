import { Routes } from '@angular/router';
import { LoginComponent } from '../users/login.component';
import { inject } from '@angular/core';
import { StateService } from '../state.service';
import { WelcomeComponent } from '../goals/getStarted/welcome.component';
import { GoalsResolver } from '../goals/routes/goals.resolver';

// # global variables for routes

export const routes: Routes = [
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: 'welcome', component: WelcomeComponent},
    { path: 'login', component: LoginComponent },
    { path: 'register', loadComponent: () => import('../users/register/register.component').then(c => c.RegisterComponent) },
    { path: 'goals', 
        loadChildren: () => import('../goals/routes/goals.routes').then(r => r.goalsRoutes),
        canActivate: [ () => inject(StateService).isLoggedIn() ],
        resolve: {
            goals: GoalsResolver
          }
    },

];
