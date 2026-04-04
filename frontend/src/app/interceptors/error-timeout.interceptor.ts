import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timeout, catchError, TimeoutError, throwError } from 'rxjs';

export const errorTimeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    timeout(20_000),
    catchError((err) => {
      const isNetworkProblem =
        err instanceof TimeoutError ||
        (err instanceof HttpErrorResponse && err.status === 0);

      if (isNetworkProblem) {
        snackBar.open('Connection problem — please try again.', 'OK', { duration: 5000 });
      }

      return throwError(() => err);
    })
  );
};
