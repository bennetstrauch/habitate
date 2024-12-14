import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { addTokenInterceptor } from '../add-token.interceptor';
import { StateService } from '../state.service';


export const appConfig: ApplicationConfig = {

  providers: [
    provideAppInitializer(readStateFromLocalStorage),

    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([addTokenInterceptor]))
  ]
};

// #global var for habitate-app-state
function readStateFromLocalStorage() {
  const stateService = inject(StateService);
  const state = localStorage.getItem('HABITATE_APP_STATE');
  if (state) {
    stateService.$state.set(JSON.parse(state));
  }
}