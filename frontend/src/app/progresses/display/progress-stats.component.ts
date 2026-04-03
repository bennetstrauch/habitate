import { Component, effect, inject } from '@angular/core';
import { DisplayGoalWithLinkComponent } from '../../goals/display-goal-with-link.component';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { GoalsService } from '../../goals/goals.service';
import { ProgressService } from '../progresses.service';
import { MatButton } from '@angular/material/button';
import { DateHeaderWithTimestepComponent } from './date-header-with-timestep.component';
import { StatsService } from '../stats.service';
import { ReflectionsService } from '../../reflections/reflections.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ProgressPeriod } from '../progress-period.enum';

@Component({
  selector: 'app-progress-stats',
  imports: [
    DisplayGoalWithLinkComponent,
    NgClass,
    NgTemplateOutlet,
    MatButton,
    DateHeaderWithTimestepComponent,
    MatButtonToggleModule,
  ],
  template: `
    <!-- dateheader, timestep, dateRange -->
    <app-date-header-with-timestep
      [$currentTimeStep]="statsService.$statsTimeStep"
      [$dateOrDateRangeToShow]="statsService.$dateRangeToShow()"
    ></app-date-header-with-timestep>

    <div class="center-viewport">
      <div class="flex-row">
        <!-- ### impl -->
        <!-- <mat-button-toggle-group
          vertical
          style="margin-right: 2rem;"
          [value]="period"
          (change)="period = $event.value"
        >
          <mat-button-toggle value="week">Week</mat-button-toggle>
          <mat-button-toggle value="month">Month</mat-button-toggle>
        </mat-button-toggle-group> -->

        <div class="card">
          @for (goal of goalsService.$goals(); track $index) {
          <div class="goal-div">
            <app-display-goal-with-link
              [goalId]="goal._id"
              [goalName]="goal.name"
            />

            <div class="container">
              @for (habit of goal.habits; track habit._id) {
                @let progress = habit.latestProgress;
                <div class="habit-div" [ngClass]="{ 'completed-habit': progress.completed }">
                  <ng-container *ngTemplateOutlet="ring; context: { done: getDone(habit._id), total: habit.frequency ?? 7 }"></ng-container>
                  {{ habit.name }}
                </div>
              }
            </div>
          </div>
          <br />
          }
          <div
            class="habit-div"
            [ngClass]="{ 'completed-habit': reflectionsService.$reflection()?.completed }"
          >
            <ng-container *ngTemplateOutlet="ring; context: { done: getReflDone(), total: 7 }"></ng-container>
            <strong>Daily Reflection</strong>
          </div>

          <ng-template #ring let-done="done" let-total="total">
            <svg class="progress-ring" viewBox="0 0 36 36" width="34" height="34">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#eee" stroke-width="3"/>
              <circle
                cx="18" cy="18" r="14" fill="none"
                [attr.stroke]="arcColor(done, total)"
                stroke-width="3"
                stroke-linecap="round"
                [attr.stroke-dasharray]="C"
                [attr.stroke-dashoffset]="dashOffset(done, total)"
                transform="rotate(-90 18 18)"
              />
              <text x="18" y="18" text-anchor="middle" dominant-baseline="central"
                font-size="7.5" font-family="Roboto,sans-serif" font-weight="500"
                [attr.fill]="done === 0 ? '#bbb' : arcColor(done, total)">
                {{done}}/{{total}}
              </text>
            </svg>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./styles-for-display-progress.scss'],
  styles: `
    .progress-ring {
      flex-shrink: 0;
    }

    .center-viewport {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.card-container {
  display: flex;
  justify-content: center;
  width: 100%;
}
  `,
})
export class ProgressStatsComponent {
  goalsService = inject(GoalsService);
  progressService = inject(ProgressService);
  reflectionsService = inject(ReflectionsService);
  statsService = inject(StatsService);

  period: ProgressPeriod = ProgressPeriod.Week;

  readonly C = 2 * Math.PI * 14; // circumference for r=14

  getDone(habitId: string): number { return this.statsService.$progressStatsMap().get(habitId)?.completed ?? 0; }
  getReflDone(): number { return this.reflectionsService.$reflectionStats()?.completed ?? 0; }

  dashOffset(done: number, total: number): number {
    const pct = total > 0 ? done / total : 0;
    return this.C * (1 - pct);
  }

  arcColor(done: number, total: number): string {
    if (done === 0 || total === 0) return '#ccc';
    const hue = Math.round((done / total) * 120); // 0=red-ish → 120=green
    return `hsl(${hue}, 52%, 50%)`;
  }

  setPeriod(period: ProgressPeriod) {
    this.period = period;
    //  ##
  }

  constructor() {}
}
