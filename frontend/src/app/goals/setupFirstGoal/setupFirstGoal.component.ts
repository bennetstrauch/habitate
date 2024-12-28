import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup-first-goal',
  imports: [],
  template: `
    <p>
      NOT IMPLEMENTED YET
    </p>
  `,
  styles: ``
})
export class SetupFirstGoalComponent {

  #router = inject(Router);


  constructor() {
    this.#router.navigate(['', 'goals', 'add']);
  }

  // if user does not have a reflectionTrigger (stored in mongo) redirect to setup
}
