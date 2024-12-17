import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { GoalsService } from '../goals.service';
import { Router } from '@angular/router';
import { Goal, GoalBase } from '@backend/goals/goals.model';

@Component({
  selector: 'app-addGoal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `




    

      <mat-stepper linear #stepper >


        <mat-step [stepControl]="goalForm.step1">

          <mat-form-field>
            <mat-label>Title</mat-label>
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
            <button mat-button type="submit" color="primary" (click)="addGoal()">
              Submit
            </button>
          </div>
        </mat-step>
      </mat-stepper>
    
  `,
  styles: [``],
})
export class AddGoalComponent {
  #goalsService = inject(GoalsService);
  #router = inject(Router);


  formBuilder = inject(FormBuilder);

  goalForm = {
    step1: this.formBuilder.group({
      name: ['', Validators.required],
    }),
    step2: this.formBuilder.group({
      description: [''],
    })
  }

  addGoal() {

    const newGoal: GoalBase = {
      name: this.goalForm.step1.value.name!,
      description: this.goalForm.step2.value.description,
    }

    this.#goalsService.post_goal(newGoal).subscribe(response => {
      console.log(response)
      this.#router.navigate(['', 'habits', 'add']);
    })
  }

}
