import { Component, effect, inject, input, signal } from '@angular/core';
import { DateHeaderWithTimestepComponent } from './date-header-with-timestep.component';
import { GoalsService } from '../../goals/goals.service';
import { DisplayGoalWithLinkComponent } from '../../goals/display-goal-with-link.component';
import { NgClass } from '@angular/common';
import { ProgressService } from '../progresses.service';
import { MatIcon } from '@angular/material/icon';
import { HabitProgress } from '@backend/progresses/progress.types';
import { RouterLink } from '@angular/router';
import { ReflectionsService } from '../../reflections/reflections.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { WeeklyReflectionComponent } from '../../reflections/display/weekly-reflection.component';
import { StatsService } from '../stats.service';
import { DailyReflectionService } from '../../reflections/daily-reflection.service';
import { JoyrideModule } from 'ngx-joyride';
import { TourService } from '../../users/tour.service';
import { UpliftersService } from '../../uplifters/uplifters.service';
import { SuggestionsService } from '../../suggestions/suggestions.service';
import { SuggestionCardComponent } from '../../suggestions/suggestion-card.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

const SUGGEST_ADJECTIVES = ['uplifting', 'useful', 'encouraging', 'joyful', 'blissful', 'productive'];

@Component({
  selector: 'app-daily-progress',
  imports: [
    DisplayGoalWithLinkComponent,
    NgClass,
    MatIcon,
    RouterLink,
    MatButton,
    MatIconButton,
    WeeklyReflectionComponent,
    DateHeaderWithTimestepComponent,
    JoyrideModule,
    SuggestionCardComponent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    FormsModule,
  ],
  template: `
    <app-date-header-with-timestep
      [$currentTimeStep]="progressService.$dailyProgressTimeStep"
      [$dateOrDateRangeToShow]="progressService.$dateToShow()"
    ></app-date-header-with-timestep>

    @if (mobileIntention()) {
      <div class="mobile-intention">{{ mobileIntention() }}</div>
    }

    <div class="card">

      @let accepted = suggestionsService.$acceptedSuggestion();
      @let viewedAccepted = suggestionsService.$viewedAcceptedSuggestion();

      <!-- ── Own view: goal picker overlay (shown via toast action) ── -->
      @if (!upliftersService.$isViewingUplifter() && accepted && suggestionsService.$showGoalPicker()) {
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
          <button mat-icon-button (click)="suggestionsService.$showGoalPicker.set(false)" aria-label="Close">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }

      <!-- ── Own view: accepted suggestion (no goal) — above goals ── -->
      @if (!upliftersService.$isViewingUplifter() && accepted && !accepted.goal_id) {
        <div
          class="habit-div suggestion-habit"
          [ngClass]="{ 'completed-habit': accepted.completed }"
          (click)="toggleSuggestionCompleted()"
          style="cursor: pointer"
        >
          <mat-icon>{{ accepted.completed ? 'task_alt' : 'radio_button_unchecked' }}</mat-icon>
          <mat-icon class="sparkle">auto_awesome</mat-icon>
          {{ accepted.text }}
        </div>
      }

      <!-- ── Uplifter view: viewed user's accepted suggestion (no goal) ── -->
      @if (upliftersService.$isViewingUplifter() && viewedAccepted && !viewedAccepted.goal_id) {
        <div
          class="habit-div suggestion-habit"
          [ngClass]="{ 'completed-habit': viewedAccepted.completed }"
          style="cursor: default"
        >
          <mat-icon>{{ viewedAccepted.completed ? 'task_alt' : 'radio_button_unchecked' }}</mat-icon>
          <mat-icon class="sparkle">auto_awesome</mat-icon>
          {{ viewedAccepted.text }}
        </div>
      }

      <!-- ── Own view: pending suggestions card ── -->
      @if (!upliftersService.$isViewingUplifter()) {
        <app-suggestion-card />
      }

      @for (goal of goalsService.$goals(); track $index) {
        <div class="goal-div">
          <app-display-goal-with-link
            joyrideStep="editGoal"
            title="Tap on goal name to edit goal and its habits"
            [goalId]="goal._id"
            [goalName]="goal.name"
          />

          <!-- Display AddHabitButton if no HabitsYetCreated and viewing own profile -->
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

            <!-- ── Own view: accepted suggestion matched to this goal ── -->
            @if (!upliftersService.$isViewingUplifter() && accepted?.goal_id === goal._id) {
              <div
                class="habit-div suggestion-habit"
                [ngClass]="{ 'completed-habit': accepted!.completed }"
                (click)="toggleSuggestionCompleted()"
                style="cursor: pointer"
              >
                <mat-icon>{{ accepted!.completed ? 'task_alt' : 'radio_button_unchecked' }}</mat-icon>
                <mat-icon class="sparkle">auto_awesome</mat-icon>
                {{ accepted!.text }}
              </div>
            }

            <!-- ── Uplifter view: viewed user's accepted suggestion matched to this goal ── -->
            @if (upliftersService.$isViewingUplifter() && viewedAccepted?.goal_id === goal._id) {
              <div
                class="habit-div suggestion-habit"
                [ngClass]="{ 'completed-habit': viewedAccepted!.completed }"
                style="cursor: default"
              >
                <mat-icon>{{ viewedAccepted!.completed ? 'task_alt' : 'radio_button_unchecked' }}</mat-icon>
                <mat-icon class="sparkle">auto_awesome</mat-icon>
                {{ viewedAccepted!.text }}
              </div>
            }

            @for (habit of goal.habits; track $index) {
              @let progress = habit.latestProgress;
              <div
                class="habit-div"
                [attr.data-habit-id]="habit._id"
                [ngClass]="{ 'completed-habit': progress.completed }"
                (click)="!upliftersService.$isViewingUplifter() && toggleCompleted(progress, habit._id)"
                [style.cursor]="upliftersService.$isViewingUplifter() ? 'default' : 'pointer'"
                joyrideStep="markHabit"
                title="Mark as Done"
                text="Click on habit to change completed status"
              >
                <mat-icon>
                  {{ progress.completed ? 'task_alt' : 'radio_button_unchecked' }}
                </mat-icon>
                {{ habit.name }}
              </div>
            }

          </div>
        </div>
        <br />
      }

      <!-- ── Own view: reflection ── -->
      @if (reflectionsService.$reflection()?.completed) {
        <div class="completed-habit habit-div">
          <button mat-raised-button>
            <mat-icon>task_alt</mat-icon>
            <strong>Reflection Completed :)</strong>
          </button>
        </div>
      }

      @if (!reflectionsService.$reflection()?.completed && !upliftersService.$isViewingUplifter()) {
        <button
          mat-raised-button
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
        <br />
      }

      <!-- ── Uplifter view: suggest activity button + inline form (today only) ── -->
      @if (upliftersService.$isViewingUplifter() && progressService.$dailyProgressTimeStep() === 0) {
        @if (suggestionsService.$hasSent()) {
          <div class="suggest-sent-hint">Activity suggested ✓</div>
        } @else {
          <button mat-raised-button (click)="$showSuggestForm.set(!$showSuggestForm())">
            Suggest {{ $suggestAdjective() }} activity
          </button>

          @if ($showSuggestForm()) {
            <div class="suggest-form">
              <textarea
                class="suggest-textarea"
                maxlength="90"
                placeholder="Write something uplifting…"
                [ngModel]="$suggestionText()"
                (ngModelChange)="$suggestionText.set($event)"
              ></textarea>
              <div class="suggest-form-meta">
                <span class="char-count">{{ $suggestionText().length }}/90</span>
                <mat-form-field appearance="outline" class="goal-picker-suggest">
                  <mat-label>Goal (optional)</mat-label>
                  <mat-select
                    [ngModel]="$suggestionGoalId()"
                    (ngModelChange)="$suggestionGoalId.set($event)"
                  >
                    <mat-option [value]="null">None</mat-option>
                    @for (g of goalsService.$goals(); track g._id) {
                      <mat-option [value]="g._id">{{ g.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="suggest-form-actions">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="submitSuggestion()"
                  [disabled]="!$suggestionText().trim()"
                >
                  Send
                </button>
                <button mat-button (click)="$showSuggestForm.set(false)">Cancel</button>
              </div>
            </div>
          }
        }
      }

    </div>
  `,
  styleUrls: ['./styles-for-display-progress.scss'],
  styles: `
    .mobile-intention {
      display: none;
      font-family: 'Caveat', cursive;
      font-size: 1.3rem;
      text-align: center;
      color: #888;
      padding: 2px 16px;
    }
    @media (max-width: 600px) {
      .mobile-intention { display: block; }
    }

    .suggestion-habit { color: #5a8a5a; }
    .suggestion-habit.completed-habit { color: darkgreen; }
    .sparkle { font-size: 14px; opacity: 0.6; flex-shrink: 0; }

    .goal-picker-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }
    .goal-picker { width: 220px; }

    .suggest-sent-hint { font-size: 0.85rem; color: #aaa; padding: 8px 0; }

    .suggest-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 10px;
    }
    .suggest-textarea {
      width: 100%;
      min-height: 70px;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      resize: none;
      box-sizing: border-box;
    }
    .suggest-textarea:focus { outline: none; border-color: #81c784; }
    .suggest-form-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .char-count { font-size: 0.78rem; color: #aaa; }
    .goal-picker-suggest { width: 180px; font-size: 0.85rem; }
    .suggest-form-actions { display: flex; gap: 8px; align-items: center; }
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

  $showSuggestForm = signal(false);
  $suggestionText = signal('');
  $suggestionGoalId = signal<string | null>(null);
  $suggestAdjective = signal(SUGGEST_ADJECTIVES[0]);

  constructor() {
    effect(() => {
      const date = this.progressService.$dailyProgressDate().toISOString().split('T')[0];
      const isViewingUplifter = this.upliftersService.$isViewingUplifter();

      this.$showSuggestForm.set(false);
      this.$suggestionText.set('');
      this.$suggestionGoalId.set(null);
      this.suggestionsService.$showGoalPicker.set(false);

      if (isViewingUplifter) {
        const toUserId = this.upliftersService.$activeProfileId();
        this.$suggestAdjective.set(
          SUGGEST_ADJECTIVES[Math.floor(Math.random() * SUGGEST_ADJECTIVES.length)]
        );
        this.suggestionsService.checkSentToUser(toUserId, date);
        this.suggestionsService.loadAcceptedForUser(toUserId, date);
      } else {
        this.suggestionsService.$viewedAcceptedSuggestion.set(null);
        this.suggestionsService.loadReceivedForDate(date);
      }
    });
  }

  toggleCompleted(progress: HabitProgress, habitId: string) {
    progress.completed = !progress.completed;

    this.progressService.put_progress(progress).subscribe((response) => {
      if (response.success) {
        console.log('progress updated: ', response.data);
      }
      // ### what if fails, retry or show error?

      // update the Stats-Signal Completed value accordingly
      this.statsService.$progressStatsMap().get(habitId)!.completed +=
        progress.completed ? 1 : -1;
    });
  }

  toggleSuggestionCompleted() {
    const accepted = this.suggestionsService.$acceptedSuggestion();
    if (!accepted) return;
    const newCompleted = !accepted.completed;
    // optimistic update
    this.suggestionsService.$acceptedSuggestion.set({ ...accepted, completed: newCompleted });
    this.suggestionsService.toggleCompleted(accepted._id, newCompleted).subscribe();
  }

  startDailyReflection() {
    // ## start vs continue?
    //  only init if not already started
    this.dailyReflectionsService.initDailyReflection();
    this.dailyReflectionsService.$currentStep.set('start');
  }

  submitSuggestion() {
    const text = this.$suggestionText().trim();
    if (!text) return;

    const date = this.progressService.$dailyProgressDate().toISOString().split('T')[0];
    const toUserId = this.upliftersService.$activeProfileId();

    this.suggestionsService
      .post(toUserId, date, text, this.$suggestionGoalId())
      .subscribe((r) => {
        if (r.success) {
          this.$showSuggestForm.set(false);
          this.$suggestionText.set('');
          this.$suggestionGoalId.set(null);
        }
      });
  }

  changeGoal(goalId: string | null) {
    const accepted = this.suggestionsService.$acceptedSuggestion();
    if (!accepted) return;
    this.suggestionsService.changeGoal(accepted._id, goalId).subscribe(() => {
      this.suggestionsService.$showGoalPicker.set(false);
    });
  }

  ngOnInit() {
    // Check tour status on component initialization
    this.tourService.checkTourStatus().subscribe({
      next: (response) => {
        console.log('Tour status:', response.data);
        if (!response.data && this.goalsService.$goals().length > 0) {
          // Start tour if not completed
          this.tourService.startTour();
        }
      },
      error: (err) => {
        console.error('Failed to check tour status:', err);
        // Optionally start tour on error to avoid blocking user
      },
    });
  }
}
