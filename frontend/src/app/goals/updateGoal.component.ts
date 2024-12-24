import { Component, computed, effect, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GoalsService } from './goals.service';
import { MatInputModule } from '@angular/material/input';
import { Goal } from '@backend/goals/goals.model';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
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
          <strong>Habits :</strong>

            @for( habit of $goal()!.habits; track $index) {
              <mat-card class="habit-card"> 
                <div class="habit-container">

                  <span class="habit-name">{{ habit.name }}</span> 
                    <button type="button" class="small-delete-btn" mat-mini-fab aria-label="Delete" (click)="deleteHabit(habit._id)">
                      <mat-icon>delete</mat-icon>
                    </button>
                </div>
              </mat-card>
            }
        
          @if($goal()!.habits.length! < 3){
          <button mat-button type="button" [routerLink]="['','goals', _id(), 'habits', 'add']">Add Habit</button>
        } 
      
        </mat-card-content>
        <br>

        <button mat-raised-button type="submit" [disabled]="(this.goalForm.invalid || this.goalForm.pristine)">Update</button>
        &nbsp;
        <button type="button" mat-raised-button aria-label="Delete" (click)="deleteGoal()">
                      <mat-icon>delete</mat-icon> Delete Goal
                    </button>

        </form>
    </mat-card>
  `,

  styles: `
  .small-delete-btn {
  width: 30px;
  height: 30px;
  font-size: 5px; 
  }

  .delete-goal-btn {
  width: 90px;
  height: 30px;
  font-size: 5px; 
  }
  
  .habit-card {
  padding: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  }

.habit-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  }

.habit-name {
  font-size: 16px;
  font-weight: 500;
  }
  `
})
export class UpdateGoalComponent {
  #router = inject(Router);
  #goalsService = inject(GoalsService);
  readonly _id = input.required<string>()
  $goal = computed(
    () => this.#goalsService.find_goal(this._id())
  )
  



  updateHabits = () => {
      this.#goalsService.get_habits(this._id()).subscribe(
        response => {
          if(response.success)
          this.$goal()!.habits = response.data
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
     
        this.goalForm.patchValue({
          name: goal!.name || '',
          description: goal!.description || ''
        });
        this.goalForm.markAsPristine();
      
    }

    onSubmit = () => {
      
      const goal : Goal = {
        ...this.$goal()!,
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


    deleteGoal = () => {
      this.#goalsService.delete_goal(this._id()).subscribe(
        response => {
          console.log(' delete response: ', response)
          if (response.success){
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
