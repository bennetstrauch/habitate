import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GoalsService } from '../goals/goals.service';
import { MatInputModule } from '@angular/material/input';
import { Goal, Habit } from '@backend/goals/goals.types';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-update-habit',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
  ],
  template: `
  <!-- #make it all centered, look nicer -->
    <mat-card class="card">
      <form [formGroup]="habitForm" (ngSubmit)="updateHabit()">

        <mat-form-field>
          <mat-label>Habit</mat-label>
          <input
            matInput
            [formControl]="habitForm.controls.name"
            placeholder="your heartfelt goal"
          />
        </mat-form-field>

        <br />

        <mat-form-field>
          <mat-label>Description</mat-label>
          <input
            matInput
            [formControl]="habitForm.controls.description"
            placeholder="Enter description"
          />
        </mat-form-field>

        <br>

        <div class="card">
          <mat-label>Frequency</mat-label>
      
          <mat-slider
            discrete
            showTickMarks
            min="1"
            max="7"
            step="1"
            thumbLabel
          >
            <input 
            matInput
            matSliderThumb 
            [formControl]="habitForm.controls.frequency"
             />
          </mat-slider>

          <p class="display-frequency"> <strong>{{ habitForm.value.frequency }}</strong> times a week </p>

        </div>
        <br />

        <button
          mat-raised-button
          type="submit"
          [disabled]="this.habitForm.invalid || this.habitForm.pristine"
        >
          Update
        </button>
        &nbsp;
        <button
          type="button"
          mat-raised-button
          aria-label="Delete"
          (click)="deleteHabit()"
        >
          <mat-icon>delete</mat-icon> Delete Habit
        </button>
      </form>
    </mat-card>
    <br>
  
    @if($showUpdateMessage()){
      <!-- ##design -->
    Habit updated :)
  }
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

.display-frequency {
  margin: 2px;
}
  `,
})
export class UpdateHabitComponent {
  #router = inject(Router);
  goalsService = inject(GoalsService);

  readonly _id = input.required<string>();
  readonly habit_id = input.required<string>();

  //# create a find_habit method in goals service similar to find_goal ?
  $goal = computed(() => this.goalsService.find_goal(this._id()));

  $habit = computed(() =>
    this.$goal()?.habits.find((habit) => habit._id === this.habit_id())
  );

  //
  updateHabits = () => {
    this.goalsService.get_habits_for_goal(this._id()).subscribe((response) => {
      if (response.success) this.$goal()!.habits = response.data;
    });
  };

  formBuilder = inject(FormBuilder);

  habitForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    frequency: [7, Validators.required],
  });

  ngOnInit() {
    console.log('update habit component, habit_id: ', this.habit_id(), ' goal_id: ', this._id());
    const habit = this.$habit();

    this.habitForm.patchValue({
      name: habit!.name || '',
      description: habit!.description || '',
      frequency: habit!.frequency,
    });
    this.habitForm.markAsPristine();

    // remove updateMessage when user starts typing
    this.habitForm.valueChanges.subscribe((value) => {
      this.$showUpdateMessage.set(false);
    })
  }

  $showUpdateMessage = signal(false);

  updateHabit = () => {

    this.$habit()!.name = this.habitForm.controls.name.value!;
    this.$habit()!.description = this.habitForm.controls.description.value!;
    this.$habit()!.frequency = this.habitForm.controls.frequency.value!;

    this.goalsService.put_goal(this.$goal()!).subscribe((response) => {
      console.log(' update response: ', response);
      if (response.success) {
        // this.updateHabits()
        this.goalsService.update_goals();
        this.habitForm.markAsPristine(); // reset form to pristine state
        this.$showUpdateMessage.set(true);
      }
    });
  };


  deleteHabit = () => {
    this.goalsService.deleteHabit(this._id(), this.habit_id())
    this.#router.navigate(['', 'goals', this._id(), 'update']);
  };


  
   
}
