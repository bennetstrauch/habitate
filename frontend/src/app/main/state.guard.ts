import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateService } from '../state.service';


export const stateGuard: CanActivateFn = () => {

  const stateService = inject(StateService);
  const router = inject(Router);

  if (stateService.isLoggedIn()) {
    return router.createUrlTree(['', 'overview']) 
  }

  return true; 
}
