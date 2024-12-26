import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StateService } from '../state.service';

// globaliye Token Expired error string ## does it create const for every interception?

export const checkTokenResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const stateService = inject(StateService);
  
  return next(req).pipe(

    catchError((error) => {
      console.log('checkTokenResponseInterceptor, error> ', error);
      if (error.status === 401 && error.error === 'Token Expired') {
        alert('Your session has expired. Please log in again.');

      

        stateService.logout();
      }

      return throwError(() => error);
    })
  );
};
