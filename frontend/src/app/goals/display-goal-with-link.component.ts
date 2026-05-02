import { NgStyle } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getTodayGoalColor } from './goal-day-color';

@Component({
  selector: 'app-display-goal-with-link',
  imports: [RouterLink, NgStyle],
  template: `
    <div
      class="goal-name"
      [routerLink]="['', 'goals', goalId()]"
      [ngStyle]="{'color': todayColor}"
    >
      {{ goalName() }}
    </div>
  `,
  styles: `
    .goal-name {
      color: rgb(221, 133, 0);
      display: block;
      text-align: center;
      font-weight: 600;
      letter-spacing: 0.01em;
      margin-bottom: 8px;
    }
  `,
})
export class DisplayGoalWithLinkComponent {
  readonly goalId = input.required<string>();
  readonly goalName = input.required<string>();

  todayColor = getTodayGoalColor();
}
