import { Component, effect, inject } from '@angular/core';
import { DisplayGoalWithLinkComponent } from '../../goals/display-goal-with-link.component';
import { NgClass } from '@angular/common';
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
              @for (habit of goal.habits; track $index){ @let progress =
              habit.latestProgress;

              <div
                class="habit-div"
                [ngClass]="{ 'completed-habit': progress.completed }"
              >
                <button mat-button class="progress-display">
                  <strong>{{
                    statsService.$progressStatsMap().get(habit._id)
                      ?.completed ?? 0
                  }}</strong>
                  <!-- move that in method # -->
                  /{{ habit.frequency }}
                </button>

                {{ habit.name }}
              </div>

              }
            </div>
          </div>
          <br />
          } @let reflectionStats = reflectionsService.$reflectionStats();
          <div
            class="habit-div"
            [ngClass]="{
              'completed-habit': reflectionsService.$reflection()?.completed
            }"
          >
            <button mat-raised-button>
              <button mat-button class="progress-display">
                <strong>{{
                  reflectionStats?.completed ?? 'Could not load stats'
                }}</strong>
                <!-- move that in method # -->
                / 7
              </button>

              <strong>Daily Reflection</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./styles-for-display-progress.scss'],
  styles: `
  
    .progress-display {
    padding: 2px 4x; /* Minimal padding for content */
    margin: 0;
    line-height: 1; /* Remove extra line height spacing */
    height: auto; /* Ensure no extra height */
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

  setPeriod(period: ProgressPeriod) {
    this.period = period;
    //  ##
  }

  constructor() {}
}
