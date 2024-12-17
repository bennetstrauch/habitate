import { Component, inject, signal } from '@angular/core';
import { GoalsService } from './goals.service';
import { Router } from '@angular/router';
import { Goal } from '@backend/goals/goals.model';

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


  constructor() {
    this.#goalsService.get_goals().subscribe(response => {
      if (response.success) this.$goals.set(response.data);

      if (this.$goals().length === 0) {
        this.#router.navigate(['', 'goals', 'setup']);
      }
    });
  }

  // if user does not have a reflectionTrigger (stored in mongo) redirect to setup


}
