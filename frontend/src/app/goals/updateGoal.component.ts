import { Component, computed, effect, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GoalsService } from './goals.service';
import { MatInputModule } from '@angular/material/input';
import { Goal } from '@backend/goals/goals.model';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-update',
  imports: [MatCardModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatButtonModule, RouterLink, MatIconModule],
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
        <!-- put below and always visible besides already 3 habits, then greyed out or so -->
          <strong>Habits :</strong>
            @for( habit of $goal().habits; track $index) {
              <br>
              <mat-card>
                {{ habit.name }}
                <button type="button" mat-fab aria-label="Delete" (click)="deleteHabit(habit._id)">
          <mat-icon>delete</mat-icon>
        </button>
              </mat-card>

             
              
            }
          <br>
          @if($goal().habits.length < 3){
          <button mat-button type="button" [routerLink]="['','goals', _id(), 'habits', 'add']">Add Habit</button>
        } 
      

        </mat-card-content>

        <button mat-raised-button type="submit" [disabled]="(this.goalForm.invalid || this.goalForm.pristine)">Update</button>
        </form>

    </mat-card>
  `,
  styles: ``
})
export class UpdateGoalComponent {
  #goalsService = inject(GoalsService);
  readonly _id = input.required<string>()
  $goal = computed(
    () => this.#goalsService.$goals().filter(this._id)[0]
  )
  



  updateHabits = () => {
      this.#goalsService.get_habits(this._id()).subscribe(
        response => {
          if(response.success)
          this.$goal().habits = response.data
        }
      );
    }
  


  formBuilder = inject(FormBuilder);

  goalForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
    })
   

  
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
        description: this.goalForm.controls.description.value ?? '',
      };

      this.#goalsService.put_goal(goal).subscribe(
        response => {
          console.log(' update response: ', response)
          if (response.success){
            // this.updateHabits()
            this.#goalsService.update_goals()

          }
        }
      );
    }


    deleteHabit = (habit_id : string) => {
      this.#goalsService.remove_habit(this._id(), habit_id).subscribe(
        response => {
          console.log(' delete response: ', response)
          if (response.success){
            // this.updateHabits()
            this.#goalsService.update_goals()
          }
        }
      );
    }

}
