import { Component, inject, signal } from '@angular/core';
import { GoalsService } from './goals.service';
import { Router, RouterLink } from '@angular/router';
import { Goal, Habit } from '@backend/goals/goals.model';

@Component({
  selector: 'app-goals',
  imports: [RouterLink],
  template: `
    
    @for (goal of $goals(); track $index) {
      <div [routerLink]="['', 'goals', goal._id]"> {{goal.name}} </div>
    }
  `,
  styles: ``
})
export class GoalsComponent {
  #router = inject(Router);
  #goalsService = inject(GoalsService)

  $goals = signal<Goal[]>([])

// ####idea: methods like this: if(condition)navigateTo(path), or findAll(objects)with(condition)
// signature const function if(condition : boolean)navigateTo(path: string){}

// this way better or effect? when does the constructor trigger? ### router
  constructor() {
    this.#goalsService.get_goals().subscribe(response => {
      if (response.success) this.$goals.set(response.data);
      console.log(
        'response: ', response, 'retreived goals: ', this.$goals)

      if (this.$goals().length === 0) {
        this.#router.navigate(['', 'goals', 'setup']);
      }
    });



    // ###
    const allHabits = this.$goals()
      .flatMap(goal => goal.habits || []);

      console.log(allHabits, 'all habits')
    // this.#goalsService.$habits.set(allHabits);
  }
    
}

  // if user does not have a reflectionTrigger (stored in mongo) redirect to setup


