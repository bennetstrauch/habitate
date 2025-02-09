import { inject, Injectable } from '@angular/core';
import { Resolve, ResolveFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { Goal } from '@backend/goals/goals.types';
import { GoalsService } from '../../goals/goals.service';


export const GoalsResolver : ResolveFn<Goal[]> = () => {
  const goalsService = inject(GoalsService)

  
  return goalsService.get_goals().pipe(
    map(response => {

      if (response.success) {
        goalsService.$goals.set(response.data);
        return response.data;
      }

      return [];
    })
  );


}