import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { GoalsService } from './goals.service';
import { Goal } from '@backend/goals/goals.types';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AddHabitComponent } from '../habits/addHabit/addHabit.component';
import { AddHabitButtonComponent } from '../habits/addHabit/add-habit-button.component';

@Component({
  selector: 'app-goal',
  imports: [
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    AddHabitComponent,
    AddHabitButtonComponent,
  ],
  template: `
    <div style="text-align: center;">
      <mat-card class="card">
        <u>Goal</u> <br />
        <div>
          <strong>{{ $goal()!.name }}</strong>
        </div>
        <br />
        <div>{{ $goal()!.description }}</div>
        <br />

        <!-- <app-add-habit-button
        [goal_id]="_id()"
        [numberOfHabitsForGoal]="$goal()!.habits.length"
      /> -->
      </mat-card>

      <button mat-raised-button aria-label="Edit" (click)="updateGoal()">
        <mat-icon>edit</mat-icon> Edit
      </button>

      <mat-card class="card">
        <u>Habits</u> <br />

        @for( habit of $goal()!.habits; track $index) {
        <mat-card class="habit-card">
          <div class="habit-container">
            <span class="habit-name">{{ habit.name }}</span>
          </div>
        </mat-card>
        }

        <!-- not hardcode number ## -->
        <app-add-habit-button
          [goal_id]="_id()"
          [numberOfHabitsForGoal]="$goal()!.habits.length"
        />
      </mat-card>
      <br />
    </div>
  `,
  styleUrls: ['../habits/styles-for-display-habits.scss'],
  styles: ``,
})
export class GoalComponent {
  #router = inject(Router);
  #goalsService = inject(GoalsService);

  readonly _id = input.required<string>();

  // ## unify, put getGoal method in goalsService
  $goal = computed(() => this.#goalsService.find_goal(this._id()));

  constructor() {
    effect(() => {
      console.log(this._id());
    });
  }

  updateGoal = () => {
    // # should be edit
    this.#router.navigate(['', 'goals', this.$goal()!._id, 'update']);
  };
}
