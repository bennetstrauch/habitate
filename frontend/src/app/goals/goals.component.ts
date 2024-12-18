import { Component, inject, signal } from '@angular/core';
import { GoalsService } from './goals.service';
import { Router } from '@angular/router';
import { Goal, Habit } from '@backend/goals/goals.model';

@Component({
  selector: 'app-goals',
  imports: [],
  template: `
    <p>
      goals works!
    </p>
  `,
  styles: ``
})
export class GoalsComponent {
  #router = inject(Router);
  #goalsService = inject(GoalsService)

  $goals = signal<Goal[]>([])

// ####idea: methods like this: if(condition)navigateTo(path), or findAll(objects)with(condition)
// signature const function if(condition : boolean)navigateTo(path: string){}

// this way better or effect? when does the constructor trigger? ### see register
  constructor() {
    this.#goalsService.get_goals().subscribe(response => {
      if (response.success) this.$goals.set(response.data);

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


