import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-display-goal-with-link',
  imports: [RouterLink],
  template: `
    <div
      [routerLink]="['', 'goals', goalId()]"
      style="color: grey; display: inline"
    >
      {{ goalName() }}
    </div>
  `,
  styles: ``,
})
export class DisplayGoalWithLinkComponent {
  readonly goalId = input.required<string>();
  readonly goalName = input.required<string>();
}
