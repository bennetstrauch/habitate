import { Component, inject, input } from '@angular/core';
import { GoalsService } from '../goals/goals.service';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Habit } from '@backend/goals/goals.model';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-habit',
  imports: [MatStepperModule, MatFormField, MatLabel, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <mat-stepper linear #stepper >


<mat-step [stepControl]="goalForm.step1">

  <mat-form-field>
    <mat-label>Habbit</mat-label>
    <input matInput [formControl]="goalForm.step1.controls.name" placeholder="Enter title" />
  </mat-form-field>

    <div>
      <button mat-button matStepperNext [disabled]="goalForm.step1.invalid">
        Next
      </button>
    </div>
</mat-step>
    

<mat-step [stepControl]="goalForm.step2">
  <form [formGroup]="goalForm.step2">
    <mat-form-field>
      <mat-label>Description</mat-label>
      <input matInput formControlName="description" placeholder="Enter description" />
    </mat-form-field>
    <div>
      <button mat-button matStepperPrevious>Back</button>
      <button mat-button matStepperNext [disabled]="goalForm.step2.invalid">
        Next
      </button>
    </div>
  </form>
</mat-step>

<!-- Final Step -->
<mat-step>
  <p>Review your goal and submit.</p>
  <div>
    <button mat-button matStepperPrevious>Back</button>
    <button mat-button type="submit" color="primary" (click)="addHabit()">
      Submit
    </button>
  </div>
</mat-step>
</mat-stepper>
  `,
  styles: ``
})
export class AddHabitComponent {
  #goalsService = inject(GoalsService);
  #router = inject(Router);

  id = input.required<string>()
  
  constructor(){
  }


  formBuilder = inject(FormBuilder);

  goalForm = {
    step1: this.formBuilder.group({
      name: ['', Validators.required],
    }),
    step2: this.formBuilder.group({
      description: [''],
    })
  }

  addHabit() {

    const newHabit: Habit = {
      name: this.goalForm.step1.value.name!,
      description: this.goalForm.step2.value.description,
    }

    // this.#goalsService.put_goal(this.id).subscribe(response => {
    //   console.log(response)
    //   this.#router.navigate(['', 'habits', 'add']);
    // })
  }
}
