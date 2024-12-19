import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsService } from './goals.service';
import { Goal } from '@backend/goals/goals.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-goal',
  imports: [MatIconModule],
  template: `
   <button mat-icon-button aria-label="Update" (click)="onUpdate()">
          <mat-icon>edit</mat-icon>
        </button>
    <div> {{$goal().name}} </div> <br>
    <div> {{$goal().description}} </div>

  `,
  styles: ``
})
export class GoalComponent {
  #router = inject(Router);
  #goalsService = inject(GoalsService)
  
  readonly id = input.required<string>()
  //@@ signal needed, what type?
  $goal = computed(
    () => this.#goalsService.$goals().filter(this.id)[0]
  )
  
  constructor(){
    effect(
      () => {  console.log(this.id()) }
    )
  }

  onUpdate = () => {
    this.#router.navigate(['', 'goals', this.$goal()._id, 'update']);
  }

  
}
