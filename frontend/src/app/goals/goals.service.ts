import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { Goal, GoalBase, Habit, HabitBase } from '@backend/goals/goals.types';
import { environment } from 'frontend/src/environments/environment.development';
import { Router } from '@angular/router';
import { HabitProgress } from '@backend/progress/progress.types';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  #router = inject(Router);

  #http = inject(HttpClient);

  $habits = signal<Habit[]>([]);

  $goals = signal<Goal[]>([]);

  getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

  update_goals() {
    this.get_goals().subscribe((response) => {
      if (response.success) {
        this.$goals.set(response.data);
        console.log('goals updated: ', response.data);
      }
    });
  }

  find_goal(goal_id: string) {
    const goal = this.$goals().find((goal) => goal._id === goal_id);

    if (!goal) {
      console.error('No goal found. Redirecting...');
      this.#router.navigate(['', 'goals']);
      return;
    }

    return goal;
  }

  get_goals(page: number = 1) {
    const userTimezone = this.getTimezone();
   
    return this.#http.get<StandardResponse<Goal[]>>(
      environment.SERVER_URL + '/goals' + '?timezone=' + userTimezone
    );
  }

  post_goal(goal: GoalBase) {
    return this.#http.post<StandardResponse<Goal>>(
      environment.SERVER_URL + '/goals',
      goal
    );
  }

  put_goal(goal: Goal) {
    return this.#http.put<StandardResponse<number>>(
      environment.SERVER_URL + '/goals' + '/' + goal._id,
      goal
    );
  }

  // ##put in habitService

  delete_goal(goal_id: string) {
    return this.#http.delete<StandardResponse<number>>(
      environment.SERVER_URL + '/goals' + '/' + goal_id
    );
  }

  get_habits(goal_id: string) {
    return this.#http.get<StandardResponse<Habit[]>>(
      environment.SERVER_URL + '/goals' + '/' + goal_id + '/' + 'habits'
    );
  }

  add_habit(goal_id: string, habit: HabitBase) {
    return this.#http.post<StandardResponse<number>>(
      environment.SERVER_URL + '/goals' + '/' + goal_id + '/' + 'habits',
      {habit, timezone: this.getTimezone()}
    );
  }

  remove_habit(goal_id: string, habit_id: string) {
    return this.#http.delete<StandardResponse<number>>(
      environment.SERVER_URL +
        '/goals' +
        '/' +
        goal_id +
        '/' +
        'habits' +
        '/' +
        habit_id
    );
  }

  get_progress(progress_id: string) {
    return this.#http.get<StandardResponse<HabitProgress[]>>(
      environment.SERVER_URL + 'progresses' + '/' + progress_id
    );
  }

  put_progress(progress: HabitProgress) {
    return this.#http.put<StandardResponse<number>>(
      environment.SERVER_URL + '/progresses' + '/' + progress._id,
      progress
    );
  }
}
