import { Component, inject, input, Input, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProgressService } from '../progresses.service';

@Component({
  selector: 'app-date-header-with-timestep',
  imports: [MatIconModule],
  template: `
    <div class="flex-row">
      <button
        class="change-day"
        [disabled]="$currentTimeStep() <= minStep()"
        (click)="$currentTimeStep.set($currentTimeStep() - 1)"
      >
        <mat-icon>navigate_before</mat-icon>
      </button>

      <div class="card head-card">
        <span [innerHTML]="$dateOrDateRangeToShow()">
        </span>
      </div>

      <button
        class="change-day"
        [disabled]="$currentTimeStep() >= maxStep()"
        (click)="$currentTimeStep.set($currentTimeStep() + 1)"
      >
        <mat-icon>navigate_next</mat-icon>
      </button>
    </div>
  `,
  styles: `

  .change-day {
      background-color: transparent; /* Removes the background color */
      color: blue;       /* Sets the text color to grey */
      // font-weight: bold;
      border: none;
      cursor: pointer;
      opacity: 0.8;
    }

    .change-day[disabled] {
    opacity: 0.2; /* 90% transparent */
    cursor: not-allowed; /* change cursor to indicate it's not clickable */
    pointer-events: none;
  }

   .flex-row {
    // border: 1px solid black;
    display: flex;
    margin-top: 1px;
    margin-bottom: 1px;
    padding: 0px;
  }

  .head-card {
    flex-direction: row;
    gap: 4px;
    justify-content: center;
    margin-top: 0px;
    margin-bottom: 0px;
  
  }


  `,
})
export class DateHeaderWithTimestepComponent {
  // ##refactor timestep maybe, + add min and max values

  progressService = inject(ProgressService);

  @Input({ required: true }) $currentTimeStep!: Signal<number> & { set: (value: number) => void };
  $dateOrDateRangeToShow = input.required();


  // ##cange back to -2
  readonly minStep = input<number>(-2);
  readonly maxStep = input<number>(0);
}
