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
import { DisplayGoalWithLinkComponent } from "./display-habit-with-description";
import { UpliftersService } from '../uplifters/uplifters.service';

@Component({
  selector: 'app-goal',
  imports: [
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    AddHabitButtonComponent,
    DisplayGoalWithLinkComponent
],
  template: `
    <div style="text-align: center;">
      <mat-card class="goal card">
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

      @if (!upliftersService.$isViewingUplifter()) {
      <button mat-raised-button aria-label="Edit" (click)="updateGoal()">
        <mat-icon>edit</mat-icon> Edit
      </button>
      }

      <mat-card class="habit card">
        <u>Habits</u> <br />

        @for( habit of $goal()!.habits; track $index) {
        <mat-card class="habit-card">
        <app-display-habit-with-description
            [habitName]="habit.name"
            [habitDescription]="habit.description || ''"
          />
        </mat-card>
        }

        @if (!upliftersService.$isViewingUplifter()) {
        <!-- not hardcode number ## -->
        <app-add-habit-button
          [goal_id]="_id()"
          [numberOfHabitsForGoal]="$goal()!.habits.length"
        />
        }
      </mat-card>
      <br />
    </div>
  `,
  styleUrls: ['../habits/styles-for-display-habits.scss'],
  styles: `
   .goal {
    background-color: #fff9c4; /* Light yellow */
    }

    .habit {
      background-color:rgb(255, 255, 255); /* White */
    }

.habit-description {
  color: lightgray;
}


    .habit-container {
      display: flex;
  flex-direction: column;
  justify-content: center; /* center vertically */
  align-items: flex-start; /* <<< important! not stretch or baseline */
  height: 100%;
      
    }
  `,
})
export class GoalComponent {
  #router = inject(Router);
  #goalsService = inject(GoalsService);
  upliftersService = inject(UpliftersService);

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
