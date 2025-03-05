import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { Goal, GoalBase, Habit, HabitBase } from '@backend/goals/goals.types';
import { environment } from 'frontend/src/environments/environment';
import { Router } from '@angular/router';
import { getTodaysDateOnlyAsString } from '@backend/utils/date.utils.shared';


@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  #router = inject(Router);

  #http = inject(HttpClient);

  $goals = signal<Goal[]>([]);

  $habitIds = computed(() =>{
    console.log('habitIds computed');
    return this.$goals().flatMap((goal) => goal.habits.map((habit) => habit._id))
  }
  );


  // #does it trigger reload of component? if yes, or even anyway: seperate service!

  // ## replace with utils
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

  // get_habit()

  get_habits_for_goal(goal_id: string) {
    return this.#http.get<StandardResponse<Habit[]>>(
      environment.SERVER_URL + '/goals' + '/' + goal_id + '/' + 'habits'
    );
  }

  add_habit(goal_id: string, habit: HabitBase) {
    const date = getTodaysDateOnlyAsString();

    return this.#http.post<StandardResponse<number>>(
      environment.SERVER_URL + '/goals' + '/' + goal_id + '/' + 'habits',
      { habit, date }
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
}
