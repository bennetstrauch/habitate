import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from '../routes/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { addTokenInterceptor } from '../interceptors/add-token.interceptor';
import { StateService } from '../state.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { checkTokenResponseInterceptor } from '../interceptors/check-token-response.interceptor';
import { JoyrideModule } from 'ngx-joyride';
import { provideServiceWorker } from '@angular/service-worker';


export const appConfig: ApplicationConfig = {

  providers: [
    provideAppInitializer(readStateFromLocalStorage),

    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([addTokenInterceptor, checkTokenResponseInterceptor])), 
    provideAnimationsAsync(),
    importProvidersFrom(JoyrideModule.forRoot()), 
    provideServiceWorker('sw.js', {
            enabled: true,
            registrationStrategy: 'registerWhenStable:30000'
          })
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