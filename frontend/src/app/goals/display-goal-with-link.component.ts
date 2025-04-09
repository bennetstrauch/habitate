import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-display-goal-with-link',
  imports: [RouterLink],
  template: `
    <div
    class="goal-name"
      [routerLink]="['', 'goals', goalId()]"
    >
      {{ goalName() }}
    </div>
  `,
  styles: `
    .goal-name {
      color: rgb(221, 133, 0); /* Goldish */
      // color: rgb(0, 95, 155); /* DarkBlue, also nice */
      display: inline;
  `,
})
export class DisplayGoalWithLinkComponent {
  readonly goalId = input.required<string>();
  readonly goalName = input.required<string>();
}
