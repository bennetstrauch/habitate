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
}
