import { Component, inject, signal } from '@angular/core';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivitySuggestion } from '@backend/suggestions/suggestions.types';
import { SuggestionsService } from './suggestions.service';

const ADJECTIVES = ['uplifting', 'useful', 'encouraging', 'joyful', 'blissful', 'productive'];

@Component({
  selector: 'app-suggestion-card',
  standalone: true,
  imports: [MatIconButton, MatButton, MatIcon],
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
    .suggestion-actions { display: flex; gap: 2px; margin-top: 2px; }
    .suggestion-divider { border-top: 1px solid #f0f0f0; margin: 10px 0; }
    .view-more-btn { font-size: 0.8rem; opacity: 0.65; margin-top: 4px; }
  `,
})
export class SuggestionCardComponent {
  suggestionsService = inject(SuggestionsService);
  #snackBar = inject(MatSnackBar);

  $expanded = signal(false);

  adjective(id: string): string {
    return ADJECTIVES[id.charCodeAt(id.length - 1) % ADJECTIVES.length];
  }

  accept(s: ActivitySuggestion) {
    this.suggestionsService.accept(s._id).subscribe((r) => {
      if (!r.success) return;
      const phrases = ['Wonderful!', 'So uplifting!', 'Beautiful!', 'How joyful!'];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      const ref = this.#snackBar.open(`${phrase} Activity accepted.`, 'Change goal', {
        duration: 6000,
      });
      ref.onAction().subscribe(() => this.suggestionsService.$showGoalPicker.set(true));
    });
  }

  dismiss(id: string) {
    this.suggestionsService.dismiss(id).subscribe();
  }
}
