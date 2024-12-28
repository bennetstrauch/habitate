import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GoalsService } from '../../goals/goals.service';


export const noGoalGuard: CanActivateFn = () => {

  const goalsService = inject(GoalsService);
  const router = inject(Router);

  console.log('noGoalGuard', goalsService.$goals().length);

  
  if (goalsService.$goals().length === 0) {
    return router.createUrlTree(['', 'goals', 'add']) 
  }

  return true; 
}

