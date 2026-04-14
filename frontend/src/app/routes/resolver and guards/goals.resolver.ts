import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { DailyViewData } from '@backend/goals/goals.types';
import { ProgressService } from '../../progresses/progresses.service';

export const GoalsResolver: ResolveFn<DailyViewData> = () => {
  return inject(ProgressService).loadDailyView();
};
