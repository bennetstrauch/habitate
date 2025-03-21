import { Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-habit-button',
  imports: [RouterLink, MatButton],
  template: `
    @if(numberOfHabitsForGoal() < 3){
    <button
      mat-button
      type="button"
      [routerLink]="['', 'goals', goal_id(), 'habits', 'add']"
    >
      Add Habit
    </button>
    }
  `,
  styles: ``,
})
export class AddHabitButtonComponent {
  readonly goal_id = input.required<string>();
  readonly numberOfHabitsForGoal = input.required<number>();
}
