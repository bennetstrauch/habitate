import { Component, computed, effect, inject, signal } from '@angular/core';
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
      <div class="stats-columns">

        <div class="stats-goals">
          @for (goal of goalsService.$goals(); track $index) {
          <div class="goal-section">
            <app-display-goal-with-link
              [goalId]="goal._id"
              [goalName]="goal.name"
            />

            <div class="container">
              @for (habit of goal.habits; track habit._id) {
                @let progress = progressService.$progressMap().get(habit._id);
                <div class="habit-div" [ngClass]="{ 'completed-habit': progress?.completed }">
                  <ng-container *ngTemplateOutlet="ring; context: { done: getDone(habit._id), total: habit.frequency ?? 7 }"></ng-container>
                  <span class="habit-text">{{ habit.name }}</span>
                </div>
              }
            </div>
          </div>
          }

          <div class="goal-section reflection-section">
            <div
              class="habit-div"
              [ngClass]="{ 'completed-habit': reflectionsService.$reflection()?.completed }"
            >
              <ng-container *ngTemplateOutlet="ring; context: { done: getReflDone(), total: 7 }"></ng-container>
              <span class="habit-text"><strong>Daily Reflection</strong></span>
            </div>
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
                font-size="7.5" font-family="'DM Sans',sans-serif" font-weight="500"
                [attr.fill]="done === 0 ? '#bbb' : arcColor(done, total)">
                {{done}}/{{total}}
              </text>
            </svg>
          </ng-template>
        </div>

        <!-- ── Intentions panel ── -->
        @let intentions = intentionsWithDate();
        @if (intentions.length > 0) {
          <div class="intentions-panel">
            <p class="intentions-label">Intentions this week</p>
            @for (item of visibleIntentions(); track item.date) {
              <div class="intention-row">
                <span class="intention-date">{{ item.dateLabel }}</span>
                <span class="intention-text">{{ item.intention }}</span>
              </div>
            }
            @if (!$intentionsExpanded() && intentions.length > INTENTIONS_PREVIEW) {
              <button mat-button class="show-more-btn" (click)="$intentionsExpanded.set(true)">
                {{ intentions.length - INTENTIONS_PREVIEW }} more
              </button>
            }
            @if ($intentionsExpanded() && intentions.length > INTENTIONS_PREVIEW) {
              <button mat-button class="show-more-btn" (click)="$intentionsExpanded.set(false)">
                Show less
              </button>
            }
          </div>
        }

      </div>
    </div>
  `,
  styleUrls: ['./styles-for-display-progress.scss'],
  styles: `
    .progress-ring { flex-shrink: 0; }
    .completed-habit { color: var(--color-done, #3a7d52); }

    .center-viewport {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-top: 16px;
    }

    .reflection-section .habit-div { justify-content: center; }

    .stats-columns {
      display: flex;
      gap: 24px;
      align-items: flex-start;
      flex-wrap: wrap;
      justify-content: center;
    }

    .stats-goals {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 280px;
    }

    .intentions-panel {
      min-width: 180px;
      max-width: 260px;
      background: var(--card-bg);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border: var(--card-border);
      border-radius: var(--radius-card);
      padding: 16px;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .intentions-label {
      margin: 0 0 2px;
      font-size: 0.78rem;
      font-weight: 500;
      color: #aaa;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .intention-row {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .intention-date {
      font-size: 0.72rem;
      color: #bbb;
    }

    .intention-text {
      font-family: 'Caveat', cursive;
      font-size: 1.05rem;
      color: #666;
      line-height: 1.3;
    }

    .show-more-btn {
      font-size: 0.8rem;
      opacity: 0.6;
      align-self: flex-start;
      padding: 0;
      min-width: unset;
    }
  `,
})
export class ProgressStatsComponent {
  goalsService = inject(GoalsService);
  progressService = inject(ProgressService);
  reflectionsService = inject(ReflectionsService);
  statsService = inject(StatsService);

  period: ProgressPeriod = ProgressPeriod.Week;
  readonly INTENTIONS_PREVIEW = 3;
  $intentionsExpanded = signal(false);

  intentionsWithDate = computed(() =>
    this.reflectionsService.$weeklyReflections()
      .filter(r => !!r.intention)
      .map(r => ({
        date: r.date,
        dateLabel: new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        intention: r.intention!,
      }))
  );

  visibleIntentions = computed(() => {
    const all = this.intentionsWithDate();
    return this.$intentionsExpanded() ? all : all.slice(0, this.INTENTIONS_PREVIEW);
  });

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
