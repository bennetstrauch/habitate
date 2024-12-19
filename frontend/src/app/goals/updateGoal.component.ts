import { Component, computed, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GoalsService } from './goals.service';
import { MatInputModule } from '@angular/material/input';
import { Goal } from '@backend/goals/goals.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-update',
  imports: [MatCardModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
  template: `
    <mat-card>
      
      <form [formGroup]="goalForm" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>Goal</mat-label>
          <input matInput [formControl]="goalForm.controls.name" placeholder="your heartfelt goal" />
      </mat-form-field>

      <br>

      <mat-form-field>
        <mat-label>Description</mat-label>
          <input matInput [formControl]="goalForm.controls.description" placeholder="Enter description" />
      </mat-form-field>
        
      <mat-card-content>
        Habits:

        <!-- @for( habit of $goal().habits; track $index) {
          {{ habit.name }}
        } -->

        </mat-card-content>

        <button mat-raised-button type="submit" [disabled]="(this.goalForm.invalid && this.goalForm.dirty)">Update</button>
        </form>

    </mat-card>
  `,
  styles: ``
})
export class UpdateGoalComponent {
  #goalsService = inject(GoalsService);
  readonly id = input.required<string>()
  $goal = computed(
    () => this.#goalsService.$goals().filter(this.id)[0]
  )

  formBuilder = inject(FormBuilder);
  // @@ one for all in service?
  goalForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
    })
   

    // @@ better way?, why update button is enabled from the beginning
    ngOnInit() {
      const goal = this.$goal();

      if (goal) {
        this.goalForm.patchValue({
          name: goal.name || '',
          description: goal.description || ''
        });
        this.goalForm.markAsPristine();
      }
    }

    onSubmit = () => {
      
      const goal : Goal = {
        ...this.$goal(),
        name: this.goalForm.controls.name.value!,   // ! because we check validity on button
        description: this.goalForm.controls.description.value,
      };
        const result = this.#goalsService.put_goal(goal);

        console.log('update result:', result)
    }

}
