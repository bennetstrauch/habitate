import { Component, inject, input, viewChild } from '@angular/core';
import { GoalsService } from '../goals/goals.service';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Habit, HabitBase } from '@backend/goals/goals.types';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Location } from '@angular/common';
import { AddHelpComponent } from './addHelp.component';

@Component({
  selector: 'app-add-habit',
  imports: [
    RouterLink,
    MatStepperModule,
    MatFormField,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    AddHelpComponent,
  ],
  template: `
    <mat-stepper class="card" linear #stepper>
      <mat-step>
        <p>
          A habit is a concrete thing to do. <br />
          Keep it small and simple. <br />
        </p>

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      <mat-step>
        <p>
          A small step towards your goal. <br />
          You feel you can do it day by day without strain. <br />
          Should require 1 - 30 minutes. <br />
        </p>

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      <mat-step [stepControl]="habitForm.step1">
        <mat-form-field>
          <mat-label>Habit</mat-label>
          <input
            matInput
            [formControl]="habitForm.step1.controls.name"
            placeholder="Enter Habit"
          />
        </mat-form-field>

        <div>
          <button
            mat-button
            matStepperNext
            [disabled]="habitForm.step1.invalid"
          >
            Next
          </button>

          <!-- yet to be implemented: -->
          <!-- <button mat-button [routerLink]="['','goals', _id, 'habits', 'add', 'help']">
              Need Help
            </button> -->
        </div>
      </mat-step>

      <mat-step [stepControl]="habitForm.step2">
        <form [formGroup]="habitForm.step2">
          <mat-form-field>
            <mat-label>Description</mat-label>
            <input
              matInput
              formControlName="description"
              placeholder="Enter description"
            />
          </mat-form-field>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button
              mat-button
              matStepperNext
              [disabled]="habitForm.step2.invalid"
            >
              Next
            </button>
          </div>
        </form>
      </mat-step>

      <mat-step>
        <p>
          Take a soft, deep breath. <br />
          Relax. <br />
        </p>

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      <!-- Final Step -->
      <mat-step>
        <p>
          Is this habit good for you and your environment? <br />
          Is it easy to do and implement? <br />
        </p>
        <div>
          <button mat-button (click)="goToStep(3)">Revise</button>
          <button mat-button type="submit" color="primary" (click)="addHabit()">
            Yes, Submit
          </button>
        </div>
      </mat-step>
    </mat-stepper>
  `,
  styles: `
    .mat-stepper-horizontal {
  width: 100%; /* Ensures it does not overflow */
  max-width: 80vw; /* Prevents it from exceeding the screen width */
  overflow-x: hidden; /* Hides any potential overflow */
}
  `,
})
export class AddHabitComponent {
  #goalsService = inject(GoalsService);
  #router = inject(Router);

  _id = input.required<string>();

  constructor(private location: Location) {}

  formBuilder = inject(FormBuilder);

  habitForm = {
    step1: this.formBuilder.group({
      name: ['', Validators.required],
    }),
    step2: this.formBuilder.group({
      description: [''],
    }),
  };

  addHabit() {
    const newHabit: HabitBase = {
      name: this.habitForm.step1.value.name!,
      description: this.habitForm.step2.value.description ?? '',
    };

    this.#goalsService.add_habit(this._id(), newHabit).subscribe((response) => {
      console.log(response);
      this.#goalsService.update_goals();
      this.#router.navigate(['', 'goals', this._id(), 'update']);
    });
  }

  $stepper = viewChild.required<MatStepper>('stepper');
  goToStep(stepIndex: number) {
    this.$stepper().selectedIndex = stepIndex - 1;
  }
}
