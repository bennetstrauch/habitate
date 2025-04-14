import { NgStyle } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-display-goal-with-link',
  imports: [RouterLink, NgStyle],
  template: `
    <div
    class="goal-name"
      [routerLink]="['', 'goals', goalId()]"
     [ngStyle]="
        {'color': todayColor }"
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

  dayColorMap: { [key: number]: string } = {
    // 0: 'rgb(208, 245, 247)', // test
   
    0: 'rgb(250, 229, 197)', // Sunday - Goldish
    // 1: 'rgb(250, 250, 250)', // Monday - White
    2: 'rgb(179, 78, 1)', // Tuesday - Light Red
    3: 'rgb(123, 157, 0)', // Wednesday - Light Green
    // 4: '#FFE0B2', // Thursday - Light Orange
    // 5: 'rgb(208, 245, 247)', // Friday - Light Cyan
    // 6: '#BBDEFB', // Saturday - Light Blue
  };
  todayColor = this.dayColorMap[new Date().getDay()];

}
