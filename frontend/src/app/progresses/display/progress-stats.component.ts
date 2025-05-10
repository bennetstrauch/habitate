import { Component, effect, inject } from '@angular/core';
import { DisplayGoalWithLinkComponent } from '../../goals/display-goal-with-link.component';
import { NgClass } from '@angular/common';
import { GoalsService } from '../../goals/goals.service';
import { ProgressService } from '../progresses.service';
import { MatButton } from '@angular/material/button';
import { DateHeaderWithTimestepComponent } from './date-header-with-timestep.component';
import { StatsService } from '../stats.service';
import { ReflectionsService } from '../../reflections/reflections.service';

@Component({
  selector: 'app-progress-stats',
  imports: [
    DisplayGoalWithLinkComponent,
    NgClass,
    MatButton,
    DateHeaderWithTimestepComponent,
  ],
  template: `
    <!-- dateheader, timestep, dateRange -->

    <app-date-header-with-timestep
      [$currentTimeStep]="statsService.$statsTimeStep"
      [$dateOrDateRangeToShow]="statsService.$dateRangeToShow()"
    ></app-date-header-with-timestep>

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
                statsService.$progressStatsMap().get(habit._id)?.completed ?? 0
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
  `,
  styleUrls: ['./styles-for-display-progress.scss'],
  styles: `
  
    .progress-display {
    padding: 2px 4x; /* Minimal padding for content */
    margin: 0;
    line-height: 1; /* Remove extra line height spacing */
    height: auto; /* Ensure no extra height */
    }
  `,
})
export class ProgressStatsComponent {
  goalsService = inject(GoalsService);
  progressService = inject(ProgressService);
  reflectionsService = inject(ReflectionsService);
  statsService = inject(StatsService);

  constructor() {}
}
