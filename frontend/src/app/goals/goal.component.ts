import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { GoalsService } from './goals.service';

@Component({
  selector: 'app-goal',
  imports: [],
  template: `
    <p>
      goal works!
    </p>
  `,
  styles: ``
})
export class GoalComponent {
  #router = inject(Router);
  readonly id = input.required<string>()
  
  constructor(){
    console.log(this.id())
  }
}
