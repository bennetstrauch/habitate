import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { Goal, GoalBase } from '@backend/goals/goals.model'
import { environment } from 'frontend/src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class GoalsService {

  #http = inject(HttpClient);


  get_goals(page: number = 1) {
    return this.#http.get<StandardResponse<Goal[]>>(environment.SERVER_URL + '/goals');
  }

  post_goal(goal: GoalBase) {
    return this.#http.post<StandardResponse<Goal>>(environment.SERVER_URL + '/goals', goal);
  }

  put_goal(goal: Goal) {
    return this.#http.put<StandardResponse<number>>(environment.SERVER_URL + '/goals' + goal._id, goal);
  }

  delete_goal(goal_id: string) {
    return this.#http.delete<StandardResponse<number>>(environment.SERVER_URL + '/goals' + '/' + goal_id);
  }
}
