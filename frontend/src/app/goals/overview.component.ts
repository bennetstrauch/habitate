import { Component, inject, signal } from '@angular/core';
import { GoalsService } from './goals.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Goal, Habit } from '@backend/goals/goals.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// ## wrap every component in div or matcard with card class?

@Component({
  selector: 'app-goals',
  imports: [RouterLink, MatIconModule, MatButtonModule],
  template: `

    <div class="card head-card">
      <strong>My Habitate</strong>
    </div>

    <div class="card">

      @for (goal of goalsService.$goals(); track $index) {
        <div class="hover-div">
        <div [routerLink]="['', 'goals', goal._id]" style="color: grey;"> {{goal.name}} </div>

        @for (habit of goal.habits; track $index){
        <div> - {{habit.name}} </div>

        }
        </div>
        <br>
      }
      <button mat-raised-button [routerLink]="['', 'goals', 'reflection']">
        Start Daily Reflection
      </button> <br>
    </div>

  `,
  styles: `
  .hover-div {
    padding: 10 px;
      font-size: 18px;
      cursor: pointer; /* Changes mouse icon to hand */
    }
  .head-card {
    margin-top: 1px;
  }
  `
})
export class OverviewComponent {
  #router = inject(Router);
  goalsService = inject(GoalsService)

  #route = inject(ActivatedRoute);


 


  // ####ideax: methods like this: if(condition)navigateTo(path), or findAll(objects)with(condition)
  // signature const function if(condition : boolean)navigateTo(path: string){}


  constructor() {

        if (this.goalsService.$goals().length === 0) {
          this.#router.navigate(['', 'goals', 'add']);
        }
     

    
    console.log(this.goalsService.$goals(), 'goals')
    // this.#goalsService.$habits.set(allHabits);
  }

}

// if user does not have a reflectionTrigger (stored in mongo) redirect to setup


