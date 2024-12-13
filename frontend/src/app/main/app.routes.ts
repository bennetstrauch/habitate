import { Routes } from '@angular/router';
import { LoginComponent } from '../users/login.component';

// # global variables for routes

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', loadComponent: () => import('../users/register.component').then(c => c.RegisterComponent) },
    { path: 'goals', loadChildren: () => import('../goals/goals.routes').then(r => r.goalsRoutes)}

];
