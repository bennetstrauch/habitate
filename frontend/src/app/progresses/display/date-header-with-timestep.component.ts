import { Component, inject, input, Input, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProgressService } from '../progresses.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-date-header-with-timestep',
  imports: [MatIconModule, MatButtonToggleModule],
  template: `
    <div class="flex-row">
      <div class="nav-btn-wrapper">
        <button
          class="change-day"
          [disabled]="$currentTimeStep() <= minStep()"
          (click)="$currentTimeStep.set($currentTimeStep() - 1)"
        >
          <mat-icon>navigate_before</mat-icon>
        </button>
        @if ($hasUnseenBefore()) {
          <mat-icon class="unseen-badge">chat_bubble</mat-icon>
        }
      </div>

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
      background-color: transparent;
      color: blue;
      border: none;
      cursor: pointer;
      opacity: 0.8;
    }

    .change-day[disabled] {
    opacity: 0.2;
    cursor: not-allowed;
    pointer-events: none;
  }

   .flex-row {
    display: flex;
    margin-top: 1px;
    margin-bottom: 1px;
    padding: 0px;
    justify-content: center;
    align-items: center;
  }

  .head-card {
    flex-direction: row;
    gap: 4px;
    justify-content: center;
    margin-top: 0px;
    margin-bottom: 0px;
  }

  .nav-btn-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .unseen-badge {
    position: absolute;
    top: 2px;
    right: -2px;
    font-size: 10px !important;
    width: 10px !important;
    height: 10px !important;
    color: #e57373;
    pointer-events: none;
    line-height: 1;
  }
  `,
})
export class DateHeaderWithTimestepComponent {
  progressService = inject(ProgressService);

  @Input({ required: true }) $currentTimeStep!: Signal<number> & { set: (value: number) => void };
  $dateOrDateRangeToShow = input.required();
  readonly $hasUnseenBefore = input<boolean>(false);

  readonly minStep = input<number>(-7);
  readonly maxStep = input<number>(0);
}
