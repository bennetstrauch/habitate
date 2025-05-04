import { NgStyle } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-display-habit-with-description',
  imports: [RouterLink, NgStyle],
  template: `
    <div class="habit-container">
      <div class="habit-name">{{ habitName() }}</div>

      <!-- ##checkout -->
      <div class="habit-description">{{ habitDescription() }}</div>
    </div>
  `,
  styles: `
    .habit-container {
        display: flex;
        flex-direction: column;
        justify-content: center; /* center vertically */
        align-items: flex-start;
        
        height: 100%;
      }

    .habit-description {
      color: lightgray;
    }
  `,
})
export class DisplayGoalWithLinkComponent {
  readonly habitName = input.required<string>();
  readonly habitDescription = input.required<string>();

  dayColorMap: { [key: number]: string } = {
    // 0: 'rgb(208, 245, 247)', // test

    0: 'rgb(255, 200, 117)', // Sunday - Goldish
    // 1: 'rgb(250, 250, 250)', // Monday - White
    2: 'rgb(179, 78, 1)', // Tuesday - Light Red
    3: 'rgb(123, 157, 0)', // Wednesday - Light Green
    // 4: '#FFE0B2', // Thursday - Light Orange
    5: 'rgb(5, 165, 173)', // Friday - Light Cyan
    // 6: '#BBDEFB', // Saturday - Light Blue
  };
  todayColor = this.dayColorMap[new Date().getDay()];
}
