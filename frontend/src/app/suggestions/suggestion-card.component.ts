import { Component, inject, signal } from '@angular/core';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivitySuggestion } from '@backend/suggestions/suggestions.types';
import { SuggestionsService } from './suggestions.service';
import { getTodayGoalColor } from '../goals/goal-day-color';

const ADJECTIVES = ['uplifting', 'useful', 'encouraging', 'joyful', 'blissful', 'productive'];

@Component({
  selector: 'app-suggestion-card',
  standalone: true,
  imports: [MatIconButton, MatButton, MatIcon, MatBadgeModule],
  template: `
    @let pending = suggestionsService.$pendingSuggestions();
    @if (pending.length > 0) {
      <div class="suggestion-card">

        <div class="suggestion-item">
          <div class="suggestion-meta">
            <strong>{{ pending[0].from_user_name }}</strong>
            <span> suggests an {{ adjective(pending[0]._id) }} activity</span>
          </div>
          <div class="suggestion-text">{{ pending[0].text }}</div>
          <div class="suggestion-actions">
            <button mat-icon-button color="primary" (click)="accept(pending[0])" aria-label="Accept">
              <mat-icon>check</mat-icon>
            </button>
            @if (showDateButton(pending[0].date)) {
              <button mat-icon-button color="accent" (click)="acceptForDate(pending[0]._id, pending[0].date)"
                [attr.aria-label]="isForTomorrow(pending[0].date) ? 'Add for tomorrow' : 'Add for today'"
                [title]="isForTomorrow(pending[0].date) ? 'Add for tomorrow' : 'Add for today'">
                @if (isForTomorrow(pending[0].date)) {
                  <span class="icon-stack">
                    <mat-icon>event_available</mat-icon>
                    <mat-icon class="icon-arrow">arrow_forward</mat-icon>
                  </span>
                } @else {
                  <mat-icon class="today-badge-icon" matBadge="Today" [style.--today-badge-bg]="goalColor">calendar_today</mat-icon>
                }
              </button>
            }
            <button mat-icon-button (click)="dismiss(pending[0]._id)" aria-label="Dismiss">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        @if (pending.length > 1) {
          @if ($expanded()) {
            @for (s of pending.slice(1); track s._id) {
              <div class="suggestion-divider"></div>
              <div class="suggestion-item">
                <div class="suggestion-meta">
                  <strong>{{ s.from_user_name }}</strong>
                  <span> suggests an {{ adjective(s._id) }} activity</span>
                </div>
                <div class="suggestion-text">{{ s.text }}</div>
                <div class="suggestion-actions">
                  <button mat-icon-button color="primary" (click)="accept(s)" aria-label="Accept">
                    <mat-icon>check</mat-icon>
                  </button>
                  @if (showDateButton(s.date)) {
                    <button mat-icon-button color="accent" (click)="acceptForDate(s._id, s.date)"
                      [attr.aria-label]="isForTomorrow(s.date) ? 'Add for tomorrow' : 'Add for today'"
                      [title]="isForTomorrow(s.date) ? 'Add for tomorrow' : 'Add for today'">
                      @if (isForTomorrow(s.date)) {
                        <span class="icon-stack">
                          <mat-icon>event_available</mat-icon>
                          <mat-icon class="icon-arrow">arrow_forward</mat-icon>
                        </span>
                      } @else {
                        <mat-icon class="today-badge-icon" matBadge="Today" [style.--today-badge-bg]="goalColor">calendar_today</mat-icon>
                      }
                    </button>
                  }
                  <button mat-icon-button (click)="dismiss(s._id)" aria-label="Dismiss">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              </div>
            }
          } @else {
            <button mat-button class="view-more-btn" (click)="$expanded.set(true)">
              View {{ pending.length - 1 }} more
            </button>
          }
        }

      </div>
    }
  `,
  styles: `
    .suggestion-card {
      background: white;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 12px;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
    }
    .suggestion-item { display: flex; flex-direction: column; gap: 4px; }
    .suggestion-meta { font-size: 0.8rem; color: #999; }
    .suggestion-meta strong { color: #666; }
    .suggestion-text { font-size: 0.95rem; color: #333; }
    .suggestion-actions { margin-top: 2px; text-align: center; }
    .suggestion-divider { border-top: 1px solid #f0f0f0; margin: 10px 0; }
    .view-more-btn { font-size: 0.8rem; opacity: 0.65; margin-top: 4px; }
    .icon-stack { position: relative; display: inline-flex; align-items: center; justify-content: center; }
    .icon-arrow { position: absolute; font-size: 13px !important; width: 13px !important; height: 13px !important; bottom: -3px; right: -5px; }
    ::ng-deep .today-badge-icon .mat-badge-content { background-color: var(--today-badge-bg); }
  `,
})
export class SuggestionCardComponent {
  suggestionsService = inject(SuggestionsService);
  #snackBar = inject(MatSnackBar);

  $expanded = signal(false);
  goalColor = getTodayGoalColor();

  adjective(id: string): string {
    return ADJECTIVES[id.charCodeAt(id.length - 1) % ADJECTIVES.length];
  }

  isAfterNoon(): boolean {
    return new Date().getHours() >= 12;
  }

  isPreviousDay(date: string): boolean {
    const t = new Date();
    const todayStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    return date.substring(0, 10) < todayStr;
  }

  showDateButton(date: string): boolean {
    return this.isAfterNoon() || this.isPreviousDay(date);
  }

  isForTomorrow(date: string): boolean {
    return !this.isPreviousDay(date) && this.isAfterNoon();
  }

  acceptForDate(id: string, date: string) {
    const forTomorrow = this.isForTomorrow(date);
    this.suggestionsService.acceptForTomorrow(id, date).subscribe((r) => {
      if (!r.success) return;
      this.#snackBar.open(forTomorrow ? 'Accepted for tomorrow!' : 'Accepted for today!', undefined, { duration: 4000 });
    });
  }

  accept(s: ActivitySuggestion) {
    this.suggestionsService.accept(s._id).subscribe((r) => {
      if (!r.success) return;
      const phrases = ['Wonderful!', 'So uplifting!', 'Beautiful!', 'How joyful!'];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      const ref = this.#snackBar.open(`${phrase} Activity accepted.`, 'Change goal', {
        duration: 6000,
      });
      ref.onAction().subscribe(() => this.suggestionsService.$goalPickerForId.set(s._id));
    });
  }

  dismiss(id: string) {
    this.suggestionsService.dismiss(id).subscribe();
  }
}
