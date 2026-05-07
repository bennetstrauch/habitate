import { Component, effect, inject, input } from '@angular/core';
import { GoalsService } from '../../goals/goals.service';
import { DisplayGoalWithLinkComponent } from '../../goals/display-goal-with-link.component';
import { NgClass } from '@angular/common';
import { ProgressService } from '../progresses.service';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ReflectionsService } from '../../reflections/reflections.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WeeklyReflectionComponent } from '../../reflections/display/weekly-reflection.component';
import { StatsService } from '../stats.service';
import { DailyReflectionService } from '../../reflections/daily-reflection.service';
import { JoyrideModule } from 'ngx-joyride';
import { TourService } from '../../users/tour.service';
import { UpliftersService } from '../../uplifters/uplifters.service';
import { SuggestionsService } from '../../suggestions/suggestions.service';
import { SuggestionCardComponent } from '../../suggestions/suggestion-card.component';
import { AcceptedSuggestionItemComponent } from '../../suggestions/accepted-suggestion-item.component';
import { SuggestActivityFormComponent } from '../../suggestions/suggest-activity-form.component';
import { getTodayGoalColor } from '../../goals/goal-day-color';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { toLocalDateString } from '../../utils/utils';

@Component({
  selector: 'app-daily-progress',
  imports: [
    DisplayGoalWithLinkComponent,
    NgClass,
    MatIcon,
    RouterLink,
    MatButton,
    MatIconButton,
    MatProgressSpinnerModule,
    WeeklyReflectionComponent,
    JoyrideModule,
    SuggestionCardComponent,
    AcceptedSuggestionItemComponent,
    SuggestActivityFormComponent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    FormsModule,
  ],
  template: `
    @if (mobileIntention()) {
      <div class="mobile-intention">{{ mobileIntention() }}</div>
    }

    <div class="daily-view">

      <!-- ── Own view: goal picker overlay (shown via toast action) ── -->
      @if (!upliftersService.$isViewingUplifter() && suggestionsService.$goalPickerForId()) {
        <div class="goal-picker-row">
          <mat-form-field appearance="outline" class="goal-picker">
            <mat-label>Move activity to goal</mat-label>
            <mat-select (selectionChange)="changeGoal($event.value)">
              <mat-option [value]="null">No goal</mat-option>
              @for (g of goalsService.$goals(); track g._id) {
                <mat-option [value]="g._id">{{ g.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-icon-button (click)="suggestionsService.$goalPickerForId.set(null)" aria-label="Close">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }

      <!-- ── Own view: accepted suggestions without a goal — above goals ── -->
      @if (!upliftersService.$isViewingUplifter()) {
        @for (s of suggestionsService.$acceptedSuggestions(); track s._id) {
          @if (!s.goal_id) {
            <app-accepted-suggestion-item [suggestion]="s" />
          }
        }
      }

      <!-- ── Uplifter view: viewed user's accepted suggestions (no goal) ── -->
      @if (upliftersService.$isViewingUplifter()) {
        @for (s of suggestionsService.$viewedAcceptedSuggestions(); track s._id) {
          @if (!s.goal_id) {
            <app-accepted-suggestion-item [suggestion]="s" [readonly]="true" />
          }
        }
      }

      <!-- ── Own view: pending suggestions card ── -->
      @if (!upliftersService.$isViewingUplifter()) {
        <app-suggestion-card />
      }

      @if (!progressService.$progressLoaded()) {
        <div style="display:flex;justify-content:center;padding:24px 0">
          <mat-spinner diameter="32" />
        </div>
      }

      @if (progressService.$progressLoaded()) {
      @for (goal of goalsService.$goals(); track $index) {
        <div class="goal-section">
          <app-display-goal-with-link
            joyrideStep="editGoal"
            title="Tap on goal name to edit goal and its habits"
            [goalId]="goal._id"
            [goalName]="goal.name"
          />

          @if (goal.habits.length === 0 && goalsService.$goals().length === 1 && !upliftersService.$isViewingUplifter()) {
            <button
              mat-button
              class="subtle-add-habit-button"
              [routerLink]="['', 'goals', goal._id, 'habits', 'add']"
            >
              Add a Habit
            </button>
          }

          <div class="container">

            <!-- ── Own view: accepted suggestions matched to this goal ── -->
            @if (!upliftersService.$isViewingUplifter()) {
              @for (s of suggestionsService.$acceptedSuggestions(); track s._id) {
                @if (s.goal_id === goal._id) {
                  <app-accepted-suggestion-item [suggestion]="s" />
                }
              }
            }

            <!-- ── Uplifter view: viewed user's accepted suggestions matched to this goal ── -->
            @if (upliftersService.$isViewingUplifter()) {
              @for (s of suggestionsService.$viewedAcceptedSuggestions(); track s._id) {
                @if (s.goal_id === goal._id) {
                  <app-accepted-suggestion-item [suggestion]="s" [readonly]="true" />
                }
              }
            }

            @for (habit of goal.habits; track $index) {
              @let progress = progressService.$progressMap().get(habit._id);
              <div
                class="habit-div"
                [attr.data-habit-id]="habit._id"
                [ngClass]="{ 'completed-habit': progress?.completed }"
                (click)="!upliftersService.$isViewingUplifter() && toggleCompleted(habit._id)"
                [style.cursor]="upliftersService.$isViewingUplifter() ? 'default' : 'pointer'"
                joyrideStep="markHabit"
                title="Mark as Done"
                text="Click on habit to change completed status"
              >
                <div class="habit-check" [class.completed]="progress?.completed"></div>
                <span class="habit-text">{{ habit.name }}</span>
              </div>
            }

          </div>
        </div>
      }
      } <!-- end @if progressLoaded -->

      <!-- ── Own view: reflection ── -->
      @if (reflectionsService.$reflection()?.completed && !upliftersService.$isViewingUplifter()) {
        <div class="reflection-cta-bar reflection-done">
          <mat-icon>task_alt</mat-icon>
          <span>Reflection done</span>
        </div>
      }

      @if (!reflectionsService.$reflection()?.completed && !upliftersService.$isViewingUplifter()) {
        <button
          class="reflection-cta-bar cta-action"
          [style.--bar-color]="todayBarColor"
          (click)="startDailyReflection()"
          [routerLink]="[
            '',
            'goals',
            'reflection',
            progressService.$dailyProgressDate().toISOString().split('T')[0]
          ]"
        >
          Start Daily Reflection
        </button>
      }

      <!-- ── Uplifter view: suggest activity (today only) ── -->
      @if (upliftersService.$isViewingUplifter() && progressService.$dailyProgressTimeStep() === 0) {
        <app-suggest-activity-form />
      }

    </div>
  `,
  styleUrls: ['./styles-for-display-progress.scss'],
  styles: `
    .daily-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 500px;
      gap: 16px;
      padding: 0 16px 32px;
      box-sizing: border-box;
    }

    .mobile-intention {
      display: none;
      font-family: 'Caveat', cursive;
      font-size: 1.3rem;
      text-align: center;
      color: #888;
      padding: 0 16px;
      margin: 16px 0;
    }
    .reflection-cta-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px 20px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.6);
      border: none;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--bar-color, #666);
      box-sizing: border-box;
    }
    .cta-action {
      cursor: pointer;
      color: var(--bar-color, #555);
      transition: opacity 0.15s;
    }
    .cta-action::after {
      content: ' →';
      font-size: 1.25em;
      font-weight: 400;
      opacity: 0.5;
      margin-left: 6px;
    }
    .cta-action:active { opacity: 0.7; }

    @media (max-width: 600px) {
      .mobile-intention { display: block; }
      .daily-view { padding-bottom: 80px; }
      .reflection-cta-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        border-radius: 0;
        padding: 18px 24px;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
        z-index: 50;
      }
    }

    .habit-div:hover { background: rgba(255, 255, 255, 0.35); }
    .habit-div:active { transform: scale(0.985); }
    .habit-div.completed-habit .habit-text {
      text-decoration: line-through;
      text-decoration-thickness: 1.5px;
      text-decoration-color: rgba(58, 125, 82, 0.4);
    }

    .goal-picker-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }
    .goal-picker { width: 220px; }

    .reflection-done { color: var(--color-done, #3a7d52); cursor: default; }
  `,
})
export class DailyProgressComponent {
  readonly mobileIntention = input<string>('');

  tourService = inject(TourService);
  goalsService = inject(GoalsService);
  progressService = inject(ProgressService);
  statsService = inject(StatsService);
  reflectionsService = inject(ReflectionsService);
  dailyReflectionsService = inject(DailyReflectionService);
  upliftersService = inject(UpliftersService);
  suggestionsService = inject(SuggestionsService);

  todayBarColor = getTodayGoalColor();

  constructor() {
    effect(() => {
      const date = toLocalDateString(this.progressService.$dailyProgressDate());
      const isViewingUplifter = this.upliftersService.$isViewingUplifter();

      this.suggestionsService.$goalPickerForId.set(null);

      if (isViewingUplifter) {
        this.suggestionsService.$acceptedSuggestions.set([]);
      } else {
        this.suggestionsService.$viewedAcceptedSuggestions.set([]);
        this.suggestionsService.loadReceivedForDate(date);
      }
    });
  }

  toggleCompleted(habitId: string) {
    const current = this.progressService.$progressMap().get(habitId);
    if (!current) return;

    const updated = { ...current, completed: !current.completed };
    this.progressService.$progressMap.update(m => new Map(m).set(habitId, updated));

    this.progressService.put_progress(updated).subscribe(() => {
      this.statsService.$progressStatsMap().get(habitId)!.completed +=
        updated.completed ? 1 : -1;
    });
  }

  changeGoal(goalId: string | null) {
    const id = this.suggestionsService.$goalPickerForId();
    if (!id) return;
    this.suggestionsService.changeGoal(id, goalId).subscribe(() => {
      this.suggestionsService.$goalPickerForId.set(null);
    });
  }

  startDailyReflection() {
    this.dailyReflectionsService.initDailyReflection();
    this.dailyReflectionsService.$currentStep.set('start');
  }

  ngOnInit() {
    this.tourService.checkAndStartTour(this.goalsService.$goals().length > 0);
  }
}
