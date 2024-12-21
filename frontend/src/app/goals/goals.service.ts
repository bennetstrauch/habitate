import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { Goal, GoalBase, Habit } from '@backend/goals/goals.model'
import { environment } from 'frontend/src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class GoalsService {

  #http = inject(HttpClient);

  $habits = signal<Habit[]>([])

  $goals = signal<Goal[]>([])


  get_goals(page: number = 1) {
    return this.#http.get<StandardResponse<Goal[]>>(environment.SERVER_URL + '/goals');
  }

  post_goal(goal: GoalBase) {
    return this.#http.post<StandardResponse<Goal>>(environment.SERVER_URL + '/goals', goal);
  }

  put_goal(goal: Goal) {
    return this.#http.put<StandardResponse<number>>(environment.SERVER_URL + '/goals' + '/' + goal._id, goal);
  }

  delete_goal(goal_id: string) {
    return this.#http.delete<StandardResponse<number>>(environment.SERVER_URL + '/goals' + '/' + goal_id);
  }

  add_habit(goal_id: string, habit: Habit) {
    return this.#http.post<StandardResponse<number>>(environment.SERVER_URL + '/goals' + '/' + goal_id + '/' + 'habits', habit);
  }

}
