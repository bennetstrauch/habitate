import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { Goal, GoalBase, Habit } from '@backend/goals/goals.model'
import { environment } from 'frontend/src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class GoalsService {

  #goalsService = inject(GoalsService);

  $habits = signal<Habit[]>([])


  get_goals(page: number = 1) {
    return this.#http.get<StandardResponse<Goal[]>>(environment.SERVER_URL + '/goals');
  }

  post_habit(habit: Habit) {
    return this.#goalsService.put_goal();
  }

  put_goal(goal: Goal) {
    return this.#http.put<StandardResponse<number>>(environment.SERVER_URL + '/goals' + goal._id, goal);
  }

  delete_habit(habit_id: string) {
    return this.#http.delete<StandardResponse<number>>(environment.SERVER_URL + '/goals' + '/' + goal_id);
  }
}
