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

@Component({
  selector: 'app-goal',
  imports: [MatIconModule, MatCardModule, MatButtonModule],
  template: `
    <mat-card class="card">
      <u>Goal</u> <br />
      <div>
        <strong>{{ $goal()!.name }}</strong>
      </div>
      <br />
      <div>{{ $goal()!.description }}</div>
      <br />
      <button mat-raised-button aria-label="Edit" (click)="updateGoal()">
        <mat-icon>edit</mat-icon> Edit
      </button>
    </mat-card>
  `,
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
