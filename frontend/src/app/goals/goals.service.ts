import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { Goal, GoalBase, Habit, HabitBase } from '@backend/goals/goals.types';
import { environment } from 'frontend/src/environments/environment';
import { Router } from '@angular/router';
import { getTodaysDateOnlyAsString } from '@backend/utils/date.utils.shared';
import { computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  #router = inject(Router);
  #http = inject(HttpClient);

  $goals = signal<Goal[]>([]);

  $habitIds = computed(() =>
    this.$goals().flatMap((goal) => goal.habits.map((habit) => habit._id))
  );

  getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Used after structural changes (add/edit/delete goal or habit).
  // Does not load progress — the effect in ProgressService handles that.
  update_goals() {
    this.get_goals().subscribe((response) => {
      if (response.success) {
        this.$goals.set(response.data);
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

  deleteHabit = (goal_id: string, habit_id: string) => {
    const confirmDelete = window.confirm('Delete this Habit?');
    if (!confirmDelete) return;

    this.remove_habit(goal_id, habit_id).subscribe((response) => {
      if (response.success) {
        this.update_goals();
      }
    });
  };

  // ____________ HTTP REQUESTS ____________

  get_goals() {
    const params = new HttpParams().set('timezone', this.getTimezone());
    return this.#http.get<StandardResponse<Goal[]>>(
      environment.SERVER_URL + '/goals',
      { params }
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

  delete_goal(goal_id: string) {
    return this.#http.delete<StandardResponse<number>>(
      environment.SERVER_URL + '/goals' + '/' + goal_id
    );
  }

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
      environment.SERVER_URL + '/goals/' + goal_id + '/habits/' + habit_id
    );
  }
}
