import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DateHeaderWithTimestepComponent } from './date-header-with-timestep.component';
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
import { CommentsService } from '../../comments/comments.service';
import { SuggestionRepliesService } from '../../suggestion-replies/suggestion-replies.service';
import { toLocalDateString } from '../../utils/utils';
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
    MatProgressSpinnerModule,
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
      [$hasUnseenBefore]="$hasUnseenBefore()"
    ></app-date-header-with-timestep>

    @if (mobileIntention()) {
      <div class="mobile-intention">{{ mobileIntention() }}</div>
    }

    <div class="card">

      @let viewedAccepted = suggestionsService.$viewedAcceptedSuggestion();

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
        @for (accepted of suggestionsService.$acceptedSuggestions(); track accepted._id) {
          @if (!accepted.goal_id) {
            <div
              class="habit-div suggestion-habit"
              [ngClass]="{ 'completed-habit': accepted.completed }"
              (click)="toggleSuggestionCompleted(accepted)"
              style="cursor: pointer"
            >
              <mat-icon>{{ accepted.completed ? 'task_alt' : 'radio_button_unchecked' }}</mat-icon>
              <mat-icon class="sparkle">auto_awesome</mat-icon>
              {{ accepted.text }}
            </div>
            @if ($replyForSuggestionId() === accepted._id) {
              <div class="suggestion-reply">
                <textarea
                  class="reply-textarea"
                  maxlength="120"
                  [placeholder]="'Tell ' + accepted.from_user_name + ' how it went\u2026'"
                  [ngModel]="$replyText()"
                  (ngModelChange)="$replyText.set($event)"
                ></textarea>
                <div class="reply-actions">
                  <button mat-button (click)="sendSuggestionReply(accepted)">Send</button>
                  <button class="reply-dismiss" (click)="dismissReply()">×</button>
                </div>
              </div>
            }
          }
        }
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

      @if (!progressService.$progressLoaded()) {
        <div style="display:flex;justify-content:center;padding:24px 0">
          <mat-spinner diameter="32" />
        </div>
      }

      @if (progressService.$progressLoaded()) {
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

            <!-- ── Own view: accepted suggestions matched to this goal ── -->
            @if (!upliftersService.$isViewingUplifter()) {
              @for (accepted of suggestionsService.$acceptedSuggestions(); track accepted._id) {
                @if (accepted.goal_id === goal._id) {
                  <div
                    class="habit-div suggestion-habit"
                    [ngClass]="{ 'completed-habit': accepted.completed }"
                    (click)="toggleSuggestionCompleted(accepted)"
                    style="cursor: pointer"
                  >
                    <mat-icon>{{ accepted.completed ? 'task_alt' : 'radio_button_unchecked' }}</mat-icon>
                    <mat-icon class="sparkle">auto_awesome</mat-icon>
                    {{ accepted.text }}
                  </div>
                  @if ($replyForSuggestionId() === accepted._id) {
                    <div class="suggestion-reply">
                      <textarea
                        class="reply-textarea"
                        maxlength="120"
                        [placeholder]="'Tell ' + accepted.from_user_name + ' how it went\u2026'"
                        [ngModel]="$replyText()"
                        (ngModelChange)="$replyText.set($event)"
                      ></textarea>
                      <div class="reply-actions">
                        <button mat-button (click)="sendSuggestionReply(accepted)">Send</button>
                        <button class="reply-dismiss" (click)="dismissReply()">×</button>
                      </div>
                    </div>
                  }
                }
              }
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
                <mat-icon>
                  {{ progress?.completed ? 'task_alt' : 'radio_button_unchecked' }}
                </mat-icon>
                {{ habit.name }}
              </div>
            }

          </div>
        </div>
        <br />
      }
      } <!-- end @if progressLoaded -->

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
                  [disabled]="!$suggestionText().trim() || $sendingSuggestion()"
                >
                  {{ $sendingSuggestion() ? 'Sending…' : 'Send' }}
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
      margin: 10px 0;
    }
    @media (max-width: 600px) {
      .mobile-intention { display: block; }
      .card { margin-top: 10px; }
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

    .suggestion-reply {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 4px 0 8px 28px;
      animation: reply-fade-in 0.3s ease;
    }
    @keyframes reply-fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .reply-textarea {
      width: 100%;
      min-height: 52px;
      padding: 8px 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      resize: none;
      box-sizing: border-box;
    }
    .reply-textarea:focus { outline: none; border-color: #81c784; }
    .reply-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .reply-dismiss {
      background: none;
      border: none;
      color: #bbb;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0 4px;
      line-height: 1;
    }
    .reply-dismiss:hover { color: #e57373; }
  `,
})
export class DailyProgressComponent {
  readonly mobileIntention = input<string>('');

  tourService = inject(TourService);
  commentsService = inject(CommentsService);
  suggestionRepliesService = inject(SuggestionRepliesService);

  $hasUnseenBefore = computed(() => {
    const currentDate = toLocalDateString(this.progressService.$dailyProgressDate());
    return this.commentsService.$datesWithUnseenComments().some(d => d < currentDate);
  });
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
  $replyForSuggestionId = signal<string | null>(null);
  $replyText = signal('');
  #replyTimer: ReturnType<typeof setTimeout> | null = null;
  $suggestAdjective = signal(SUGGEST_ADJECTIVES[0]);
  $sendingSuggestion = signal(false);

  constructor() {
    effect(() => {
      const date = this.progressService.$dailyProgressDate().toISOString().split('T')[0];
      const isViewingUplifter = this.upliftersService.$isViewingUplifter();
      const toUserId = this.upliftersService.$activeProfileId();

      this.$showSuggestForm.set(false);
      this.$suggestionText.set('');
      this.$suggestionGoalId.set(null);
      this.$sendingSuggestion.set(false);
      this.suggestionsService.$goalPickerForId.set(null);

      if (isViewingUplifter) {
        this.$suggestAdjective.set(
          SUGGEST_ADJECTIVES[Math.floor(Math.random() * SUGGEST_ADJECTIVES.length)]
        );
        this.suggestionsService.$acceptedSuggestions.set([]);
        this.suggestionsService.checkSentToUser(toUserId, date);
      } else {
        this.suggestionsService.$viewedAcceptedSuggestion.set(null);
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
      // ### what if fails, retry or show error?
      this.statsService.$progressStatsMap().get(habitId)!.completed +=
        updated.completed ? 1 : -1;
    });
  }

  toggleSuggestionCompleted(accepted: import('@backend/suggestions/suggestions.types').ActivitySuggestion) {
    const newCompleted = !accepted.completed;
    this.suggestionsService.$acceptedSuggestions.update(
      (list) => list.map((s) => s._id === accepted._id ? { ...s, completed: newCompleted } : s)
    );
    this.suggestionsService.toggleCompleted(accepted._id, newCompleted).subscribe();

    if (newCompleted) {
      this.$replyForSuggestionId.set(accepted._id);
      this.$replyText.set('');
      if (this.#replyTimer) clearTimeout(this.#replyTimer);
      this.#replyTimer = setTimeout(() => this.dismissReply(), 20000);
    } else {
      this.dismissReply();
    }
  }

  sendSuggestionReply(accepted: import('@backend/suggestions/suggestions.types').ActivitySuggestion) {
    const text = this.$replyText().trim();
    if (!text) { this.dismissReply(); return; }
    this.suggestionRepliesService.postReply(accepted._id, text)
      .subscribe(r => { if (r.success) this.dismissReply(); });
  }

  dismissReply() {
    if (this.#replyTimer) { clearTimeout(this.#replyTimer); this.#replyTimer = null; }
    this.$replyForSuggestionId.set(null);
    this.$replyText.set('');
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

    this.$sendingSuggestion.set(true);
    this.suggestionsService
      .post(toUserId, date, text, this.$suggestionGoalId())
      .subscribe({
        next: (r) => {
          this.$sendingSuggestion.set(false);
          if (r.success) {
            this.$showSuggestForm.set(false);
            this.$suggestionText.set('');
            this.$suggestionGoalId.set(null);
          }
        },
        error: () => this.$sendingSuggestion.set(false),
      });
  }

  changeGoal(goalId: string | null) {
    const id = this.suggestionsService.$goalPickerForId();
    if (!id) return;
    this.suggestionsService.changeGoal(id, goalId).subscribe(() => {
      this.suggestionsService.$goalPickerForId.set(null);
    });
  }

  ngOnInit() {
    this.tourService.checkAndStartTour(this.goalsService.$goals().length > 0);
  }
}
