import { Component, inject, signal } from '@angular/core';
import { GoalsService } from '../goals/goals.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Goal, Habit } from '@backend/goals/goals.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-goals',
  imports: [RouterLink, MatIconModule],
  template: `
    
    @for (goal of goalsService.$goals(); track $index) {
      <div [routerLink]="['', 'goals', goal._id]" style="color: grey;"> {{goal.name}} </div>

      @for (habit of goal.habits; track $index){
      <div> - {{habit.name}} </div>

      }
    }

  `,
  styles: ``
})
export class OverviewComponent {
  #router = inject(Router);
  goalsService = inject(GoalsService)

  #route = inject(ActivatedRoute);


 


  // ####ideax: methods like this: if(condition)navigateTo(path), or findAll(objects)with(condition)
  // signature const function if(condition : boolean)navigateTo(path: string){}


  constructor() {

      const goals = this.#route.snapshot.data['goals'] as Goal[];


        if (this.goalsService.$goals().length === 0) {
          this.#router.navigate(['', 'goals', 'setup']);
        }
     

    const allHabits = this.goalsService.$goals()
      .flatMap(goal => goal.habits || []);

    console.log(allHabits, 'all habits')
    console.log(goals, 'goals')
    // this.#goalsService.$habits.set(allHabits);
  }

}

// if user does not have a reflectionTrigger (stored in mongo) redirect to setup


