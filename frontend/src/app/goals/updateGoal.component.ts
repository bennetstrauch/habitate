import { Component, computed, effect, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GoalsService } from './goals.service';
import { MatInputModule } from '@angular/material/input';
import { Goal } from '@backend/goals/goals.types';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AddHabitButtonComponent } from '../habits/addHabit/add-habit-button.component';
import { AutoResizeInputDirective } from '../auto-resize-input.directive';
import { DisplayGoalWithLinkComponent } from './display-habit-with-description';

@Component({
  selector: 'app-update',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    AddHabitButtonComponent,
    AutoResizeInputDirective,
    DisplayGoalWithLinkComponent,
  ],
  template: `
    <div class="card goal-container">
      <h3 class="goal-title">Goal</h3>
      <form [formGroup]="goalForm" (ngSubmit)="updateGoal()" class="goal-form">
        <mat-form-field appearance="outline">
          <mat-label>Goal</mat-label>
          <input
            matInput
            appAutoResizeInput
            [formControl]="goalForm.controls.name"
            placeholder="Your heartfelt goal"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <input
            matInput
            appAutoResizeInput
            [formControl]="goalForm.controls.description"
            placeholder="Enter description"
          />
        </mat-form-field>
      </form>
    </div>

    <div class="button-container">
      <button
        mat-raised-button
        class="primary-button"
        (click)="updateGoal()"
        [disabled]="goalForm.invalid || goalForm.pristine"
      >
        Update
      </button>
      <button
        mat-raised-button
        class="secondary-button"
        aria-label="Delete"
        (click)="deleteGoal()"
      >
        <mat-icon>delete</mat-icon> Delete Goal
      </button>
    </div>

    <div class="card habits-container">
      <h3 class="habits-title">Habits</h3>
      <div class="habits-section">
        @for (habit of $goal()!.habits; track $index) {
        <div class="habit-card">
          <app-display-habit-with-description
            [habitName]="habit.name"
            [habitDescription]="habit.description || ''"
          />
          <div class="habit-actions">
            <button
              type="button"
              mat-icon-button
              aria-label="Edit"
              (click)="updateHabit(habit._id)"
            >
              <mat-icon>edit</mat-icon>
            </button>
            <button
              type="button"
              mat-icon-button
              aria-label="Delete"
              (click)="goalsService.deleteHabit(_id(), habit._id)"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
        }
        <app-add-habit-button
          [goal_id]="_id()"
          [numberOfHabitsForGoal]="$goal()!.habits.length"
        />
      </div>
    </div>
  `,
  styles: [
    `
      .goal-container,
      .habits-container {
        margin: 1rem auto;
      }

      .goal-title {
        font-size: 22px;
        font-weight: 600;
        color: #333;
        margin: 0px 0px 15px 0px;
        text-align: center;
      }

      .goal-form {
        display: flex;
        flex-direction: column;
        justify-content: center;

        // width: fit-content;
        // max-width: 450px;
        gap: 15px;
      }

      input {
        max-width: 40ch;
        min-width: max(90%, 20ch);
      }

      mat-form-field {
        max-width: 45ch;
        min-width: max(100%, 20ch);
      }

      .button-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 15px;
        margin: 1rem 0;
      }

      .habits-container {
        margin-top: 0;
      }

      .habits-title {
        font-size: 20px;
        font-weight: 500;
        color: #333;
        margin: 15px 0;
        text-align: center;
      }

      .habits-section {
        width: 100%;
      }

      .habit-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        margin-bottom: 8px;
        background: #f5f7fa;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
      }

      .habit-card:hover {
        transform: translateY(-2px);
      }

     

      .habit-actions {
        display: flex;
        gap: 0px;
      }

      @media (max-width: 600px) {
        .goal-form {
          max-width: 100%;
        }

        .goal-title,
        .habits-title {
          font-size: 18px;
          margin: 10px 0;
        }
      }
    `,
  ],
})
export class UpdateGoalComponent {
  #router = inject(Router);
  goalsService = inject(GoalsService);
  readonly _id = input.required<string>();
  $goal = computed(() => this.goalsService.find_goal(this._id()));

  updateHabits = () => {
    this.goalsService.get_habits_for_goal(this._id()).subscribe((response) => {
      if (response.success) this.$goal()!.habits = response.data;
    });
  };

  formBuilder = inject(FormBuilder);

  goalForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit() {
    const goal = this.$goal();

    this.goalForm.patchValue({
      name: goal!.name || '',
      description: goal!.description || '',
    });
    this.goalForm.markAsPristine();
  }

  updateGoal = () => {
    const goal: Goal = {
      ...this.$goal()!,
      name: this.goalForm.controls.name.value!,
      description: this.goalForm.controls.description.value ?? '',
    };

    this.goalsService.put_goal(goal).subscribe((response) => {
      console.log(' update response: ', response);
      if (response.success) {
        this.goalsService.update_goals();
        alert('Goal updated successfully!');
        this.goalForm.markAsPristine();
      }
    });
  };

  deleteGoal = () => {
    const confirmDelete = window.confirm('Delete this Goal?');
    if (!confirmDelete) return;

    this.goalsService.delete_goal(this._id()).subscribe((response) => {
      console.log(' delete response: ', response);
      if (response.success) {
        this.goalsService.update_goals();
      }
    });
  };

  updateHabit = (habit_id: string) => {
    this.#router.navigate([
      '',
      'goals',
      this.$goal()!._id,
      'habits',
      habit_id,
      'update',
    ]);
  };
}
