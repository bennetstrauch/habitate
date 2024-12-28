import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateService } from '../state.service';
import { GoalsService } from '../goals/goals.service';
import { validationRulesGoals } from '@global/auth/validationRules';


export const addGoalGuard: CanActivateFn = () => {

  const goalsService = inject(GoalsService);
  const router = inject(Router);

  if (goalsService.$goals().length <= validationRulesGoals.maxLength) {
    return router.createUrlTree(['', 'goals', 'overview']) 
  }

  return true; 
}

