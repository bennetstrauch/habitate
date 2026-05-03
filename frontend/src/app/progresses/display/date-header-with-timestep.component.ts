import { Component, inject, input, Input, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProgressService } from '../progresses.service';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { ProgressPeriod } from '../progress-period.enum';

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
        <span [innerHTML]="$dateOrDateRangeToShow()"></span>
        @if ($period) {
          <mat-button-toggle-group
            class="period-toggle"
            [value]="$period()"
            (change)="onPeriodChange($event)"
            hideSingleSelectionIndicator
          >
            <mat-button-toggle [value]="ProgressPeriod.Week">Week</mat-button-toggle>
            <mat-button-toggle [value]="ProgressPeriod.Month">Month</mat-button-toggle>
          </mat-button-toggle-group>
        }
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
      padding: 0;
      justify-content: center;
      align-items: center;
    }

    .head-card {
      flex-direction: column;
      align-items: center;
      gap: 6px;
      justify-content: center;
      margin: 0;
      padding: 8px 16px;
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

    .period-toggle {
      height: 22px;
      border-radius: 11px;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .period-toggle ::ng-deep .mat-button-toggle-button {
      height: 22px;
      line-height: 22px;
    }

    .period-toggle ::ng-deep .mat-button-toggle-label-content {
      line-height: 22px;
      padding: 0 9px;
      font-size: 0.67rem;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  `,
})
export class DateHeaderWithTimestepComponent {
  progressService = inject(ProgressService);
  protected readonly ProgressPeriod = ProgressPeriod;

  @Input({ required: true }) $currentTimeStep!: Signal<number> & { set: (value: number) => void };
  @Input() $period: (Signal<ProgressPeriod> & { set: (value: ProgressPeriod) => void }) | null = null;

  $dateOrDateRangeToShow = input.required();
  readonly $hasUnseenBefore = input<boolean>(false);
  readonly minStep = input<number>(-7);
  readonly maxStep = input<number>(0);

  onPeriodChange(event: MatButtonToggleChange) {
    this.$currentTimeStep.set(0);
    this.$period!.set(event.value);
  }
}
