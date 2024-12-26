import { Component, computed, inject, signal, ViewChild, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { GoalsService } from '../goals.service';
import { Router, RouterLink } from '@angular/router';
import { Goal, GoalBase } from '@backend/goals/goals.model';
import { MatCardContent, MatCardModule } from '@angular/material/card';

// #### make clear that a goal is not a concrete behavior, thats a habit
@Component({
  selector: 'app-addGoal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardContent,
    MatCardModule,
    RouterLink
  ],
  template: `


      <mat-stepper 
        class='card'
        linear 
        #stepper
       >

        <mat-step>
            <p>
            Take your time for this.
            <br>
            </p>

            <button mat-button matStepperNext>
                  Next
            </button>
        </mat-step>

        <mat-step>
    
          <p>
            A goal is an intention. <br>
            Soft & gentle. <br>
          </p>

          <button mat-button matStepperNext>
                Next
          </button>
        </mat-step>


        <mat-step [stepControl]="goalForm.step1">

        <mat-card-content>
          <p>
            What do you <strong>feel</strong>, <br> 
            right now, <br>
            is your most important goal? <br>
          </p>
          <br>

        </mat-card-content>

          <mat-form-field>
            <mat-label>Goal</mat-label>
            <input matInput [formControl]="goalForm.step1.controls.name" placeholder="your heartfelt goal" />
          </mat-form-field>

            <div>
              <button mat-button matStepperNext [disabled]="goalForm.step1.invalid">
                Next
              </button>
            </div>
        </mat-step>


        <mat-step>
          <mat-card-content>
            <p>
              Now, <br>
              relax for a few seconds.
            <br>
            </p>

            <button mat-button matStepperNext>
                  Next
            </button>

          </mat-card-content>
        </mat-step>

        <mat-step>
            <p>
              Do you feel that pursuing and achieving this goal <br>
              <br>
              will <strong>uplift,</strong> <br>
              bring <strong>growth,</strong> <br>
              bring <strong>purpose,</strong> <br>
              bring <strong>bliss</strong> <br>
              <br>
              to you <br>
              <strong>&</strong> <br>
              your environment ?
            <br>
            </p>

            <button mat-button (click)="goToStep(3)">Revise Goal</button>
            <button mat-button matStepperNext>
                  Yes
            </button>
        </mat-step>
            

        <mat-step>
          <mat-card-content>
            <p>
              Congratulations! <br>
              You are on a good track. <br>
            <br>
              " Well begun - is half done. "
            </p>

            <button mat-button matStepperNext>
                  Next
            </button>

          </mat-card-content>
        </mat-step>

        <mat-step [stepControl]="goalForm.step2">

          <p>
            Anything you would like to add? <br>
            <br>
            eg. more elaboration or underlying motivations ...
          </p>

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

       
        <mat-step>
          <p>
            This is it ! <br> 
            Fantatataaastic !
          </p>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button type="submit" matStepperNext (click)="addGoal()">
              Add Goal
            </button>
          </div>
        </mat-step>

        <mat-step>
          <p>
            If you have more time, <br>
            feel free to add your first habit to your new goal.
          </p>

          <button mat-button [disabled]='!$addHabitEnabled()' [routerLink]="['', 'goals', $newGoalId(), 'habits', 'add']">
              Add Habit
          </button>
        </mat-step>
      </mat-stepper>
    
  `,
  // ### hiding does not work
  styles: [`
    .mat-horizontal-stepper-header-container {
      display: none;
    }
    `],
})
export class AddGoalComponent {
  #goalsService = inject(GoalsService);
  #router = inject(Router);
 
  $stepper = viewChild.required<MatStepper>('stepper')

  formBuilder = inject(FormBuilder);

  goalForm = {
    step1: this.formBuilder.group({
      name: ['', Validators.required],
    }),
    step2: this.formBuilder.group({
      description: [''],
    })
  }

  $newGoalId = signal<string | null>(null)
  $addHabitEnabled = computed( () => !!this.$newGoalId() )

  addGoal() {

    const newGoal: GoalBase = {
      name: this.goalForm.step1.value.name!,
      description: this.goalForm.step2.value.description ?? '',
    }

    this.#goalsService.post_goal(newGoal).subscribe(response => {
      console.log(response)
      
      this.$newGoalId.set(response.data._id);
      this.#goalsService.update_goals()

      alert("Goal added successfully")
    })
  }


  goToStep(stepIndex: number) {
    this.$stepper().selectedIndex = stepIndex-1; 
  }


}
