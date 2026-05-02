import { Component, effect, inject, input, signal } from '@angular/core';
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
import { SuggestionRepliesService } from '../../suggestion-replies/suggestion-replies.service';
import { toLocalDateString } from '../../utils/utils';
import { getTodayBgColor, getTodayGoalColor } from '../../goals/goal-day-color';
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
    JoyrideModule,
    SuggestionCardComponent,
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
        @for (accepted of suggestionsService.$acceptedSuggestions(); track accepted._id) {
          @if (!accepted.goal_id) {
            <div
              class="habit-div suggestion-habit"
              [ngClass]="{ 'completed-habit': accepted.completed }"
              (click)="toggleSuggestionCompleted(accepted)"
              style="cursor: pointer"
            >
              <div class="habit-check" [class.completed]="accepted.completed"></div>
              <mat-icon class="sparkle">auto_awesome</mat-icon>
              <span class="habit-text">{{ accepted.text }}</span>
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

      <!-- ── Uplifter view: viewed user's accepted suggestions (no goal) ── -->
      @if (upliftersService.$isViewingUplifter()) {
        @for (accepted of suggestionsService.$viewedAcceptedSuggestions(); track accepted._id) {
          @if (!accepted.goal_id) {
            <div
              class="habit-div suggestion-habit"
              [ngClass]="{ 'completed-habit': accepted.completed }"
              style="cursor: default"
            >
              <div class="habit-check" [class.completed]="accepted.completed"></div>
              <mat-icon class="sparkle">auto_awesome</mat-icon>
              <span class="habit-text">{{ accepted.text }}</span>
            </div>
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
                    <div class="habit-check" [class.completed]="accepted.completed"></div>
                    <mat-icon class="sparkle">auto_awesome</mat-icon>
                    <span class="habit-text">{{ accepted.text }}</span>
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

            <!-- ── Uplifter view: viewed user's accepted suggestions matched to this goal ── -->
            @if (upliftersService.$isViewingUplifter()) {
              @for (accepted of suggestionsService.$viewedAcceptedSuggestions(); track accepted._id) {
                @if (accepted.goal_id === goal._id) {
                  <div
                    class="habit-div suggestion-habit"
                    [ngClass]="{ 'completed-habit': accepted.completed }"
                    style="cursor: default"
                  >
                    <div class="habit-check" [class.completed]="accepted.completed"></div>
                    <mat-icon class="sparkle">auto_awesome</mat-icon>
                    <span class="habit-text">{{ accepted.text }}</span>
                  </div>
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
        @if (!suggestionsService.$hasSent() && $showSuggestForm()) {
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
        @if (suggestionsService.$hasSent()) {
          <div class="reflection-cta-bar suggest-done-bar">Activity suggested ✓</div>
        } @else {
          <button
            class="reflection-cta-bar cta-action"
            [style.--bar-color]="todayBarColor"
            (click)="$showSuggestForm.set(!$showSuggestForm())"
          >
            Suggest {{ $suggestAdjective() }} activity
          </button>
        }
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

    .habit-div.completed-habit { opacity: 0.75; }
    .habit-div.completed-habit .habit-text {
      text-decoration: line-through;
      text-decoration-thickness: 1.5px;
      text-decoration-color: rgba(58, 125, 82, 0.4);
    }

    .suggestion-habit .habit-text { color: #5a8a5a; }
    .suggestion-habit .habit-check { border-color: rgba(90, 138, 90, 0.35); }
    .sparkle { font-size: 14px; opacity: 0.6; flex-shrink: 0; }

    .goal-picker-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }
    .goal-picker { width: 220px; }

    .reflection-done { color: var(--color-done, #3a7d52); cursor: default; }
    .suggest-done-bar { color: #aaa; cursor: default; }

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
  suggestionRepliesService = inject(SuggestionRepliesService);
  goalsService = inject(GoalsService);
  progressService = inject(ProgressService);
  statsService = inject(StatsService);
  reflectionsService = inject(ReflectionsService);
  dailyReflectionsService = inject(DailyReflectionService);
  upliftersService = inject(UpliftersService);
  suggestionsService = inject(SuggestionsService);

  todayBarColor = getTodayGoalColor();

  $showSuggestForm = signal(false);
  $suggestionText = signal('');
  $suggestionGoalId = signal<string | null>(null);
  $replyForSuggestionId = signal<string | null>(null);
  $replyText = signal('');
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
