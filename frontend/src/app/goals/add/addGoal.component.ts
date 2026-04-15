import {
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule, // Ensure this is imported from '@angular/forms'
} from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { GoalsService } from '../goals.service';
import { Router, RouterLink } from '@angular/router';
import { Goal, GoalBase } from '@backend/goals/goals.types';
import { MatCardModule } from '@angular/material/card';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatCardModule,
    RouterLink,
    TextFieldModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-stepper class="card" linear #stepper>
      <mat-step>
        <ng-template matStepperIcon="number">
          <!-- Empty template removes the number -->
        </ng-template>
        @if (goalsService.$goals().length==0){
        <h4>Ready to add your first goal ?</h4>
        }

        <p>
          Take your time for this.
          <br />
        </p>

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      <mat-step>
        <p>
          A goal is an intention. <br />
          Soft & gentle. <br />
        </p>

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      <mat-step [stepControl]="goalForm.step1">
        <mat-card-content>
          <p>
            What do you <strong>feel</strong>, <br />
            right now, <br />
            is your most important goal? <br />
          </p>
          <br />
        </mat-card-content>

        <mat-form-field>
          <mat-label>Goal</mat-label>
          <textarea
            matInput
            cdkTextareaAutosize
            cdkAutosizeMinRows="1"
            cdkAutosizeMaxRows="3"
            [formControl]="goalForm.step1.controls.name"
            placeholder="your heartfelt goal"
          ></textarea>
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
            Now, <br />
            relax for a few seconds.
            <br />
          </p>

          <button mat-button matStepperNext>Next</button>
        </mat-card-content>
      </mat-step>

      <mat-step>
        <p>
          Do you feel that pursuing and achieving this goal <br />
          <br />
          will <strong>uplift,</strong> <br />
          bring <strong>growth,</strong> <br />
          bring <strong>purpose,</strong> <br />
          bring <strong>bliss</strong> <br />
          <br />
          to you <br />
          <strong>&</strong> <br />
          your environment ?
          <br />
        </p>

        <button mat-button (click)="goToStep(3)">Revise Goal</button>
        <button mat-button matStepperNext>Yes</button>
      </mat-step>

      <mat-step>
        <mat-card-content>
          <p>
            Congratulations! <br />
            You are on a good track. <br />
            <br />
            " Well begun - is half done. "
          </p>

          <button mat-button matStepperNext>Next</button>
        </mat-card-content>
      </mat-step>

      <mat-step [stepControl]="goalForm.step2">
        <p>
          Anything you would like to add? <br />
          <br />
          eg. more elaboration or underlying motivations ...
        </p>

        <form [formGroup]="goalForm.step2">
          <mat-form-field>
            <mat-label>Description</mat-label>
            <textarea
              matInput
              cdkTextareaAutosize
              cdkAutosizeMinRows="1"
              cdkAutosizeMaxRows="5"
              formControlName="description"
              placeholder="Enter description"
            ></textarea>
          </mat-form-field>
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button
              mat-button
              matStepperNext
              [disabled]="goalForm.step2.invalid"
            >
              Next
            </button>
          </div>
        </form>
      </mat-step>

      <mat-step>
        <p>
          This is it ! <br />
          Fantatataaastic !
        </p>
        <div>
          <button
            mat-raised-button
            type="submit"
            matStepperNext
            [disabled]="$submitting()"
            (click)="addGoal()"
            style="display: inline-flex; align-items: center; gap: 8px;"
          >
            @if ($submitting()) {
              <mat-spinner diameter="18" />
              Adding…
            } @else {
              Add this Goal
            }
          </button>

          <br />
          <button mat-button matStepperPrevious class="small-button">
            Go Back
          </button>
        </div>
      </mat-step>

      <mat-step>
        <p>
          If you have more time, <br />
          feel free to add your first habit to your new goal.
        </p>

        <button
          mat-button
          [disabled]="!$addHabitEnabled()"
          [routerLink]="['', 'goals', $newGoalId(), 'habits', 'add']"
        >
          Add Habit
        </button>
      </mat-step>
    </mat-stepper>
  `,
  // ### remove all icons from stepper header
  styles: [
    `
      .small-button {
        font-size: 10px; /* Reduce font size */
      }

      ::ng-deep .mat-horizontal-stepper-header-container {
        display: none !important;
      }

      @media screen and (max-width: 768px) {
        ::ng-deep .mat-stepper {
          max-width: 100vw important!; /* Ensure it does not exceed screen width */
          width: 100%; /* Take full available width */
          margin: auto;
        }

        ::ng-deep .mat-step {
          padding: 8px;
        }
      }
    `,
  ],
})
export class AddGoalComponent {
  readonly goalsService = inject(GoalsService);
  #router = inject(Router);

  $stepper = viewChild.required<MatStepper>('stepper');

  formBuilder = inject(FormBuilder);

  goalForm = {
    step1: this.formBuilder.group({
      name: ['', Validators.required],
    }),
    step2: this.formBuilder.group({
      description: [''],
    }),
  };

  $newGoalId = signal<string | null>(null);
  $addHabitEnabled = computed(() => !!this.$newGoalId());
  $submitting = signal(false);

  addGoal() {
    const newGoal: GoalBase = {
      name: this.goalForm.step1.value.name!,
      description: this.goalForm.step2.value.description ?? '',
    };

    this.$submitting.set(true);
    this.goalsService.post_goal(newGoal).subscribe((response) => {
      this.$submitting.set(false);
      console.log(response);

      this.$newGoalId.set(response.data._id);
      this.goalsService.update_goals();

      alert(
        `Goal added successfully. \n ${this.displayRanking(
          response.data.ranking
        )}`
      );
    });
  }

  goToStep(stepIndex: number) {
    this.$stepper().selectedIndex = stepIndex - 1;
  }

  displayRanking = (ranking: number) => {
    if (ranking === 1) {
      return 'You are a trendsetter. \n No one else has a similar goal yet.';
    }

    return `You are not alone. \n ${ranking-1} other(s) have similar goals.`;
  };
}
