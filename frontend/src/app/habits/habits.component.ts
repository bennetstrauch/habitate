import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-habits',
  imports: [],
  template: `
    <p>
      habits works!
    </p>
  `,
  styles: ``
})
export class HabitsComponent {
  #router = inject(Router);
}
