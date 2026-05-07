import { Component, inject, signal } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { GoalsService } from '../goals/goals.service';
import { ProgressService } from '../progresses/progresses.service';
import { UpliftersService } from '../uplifters/uplifters.service';
import { SuggestionsService } from './suggestions.service';
import { toLocalDateString } from '../utils/utils';

const PLACEHOLDERS = [
  'What would brighten their day?',
  'What might make them smile today?',
  'Something to lift their spirits?',
  'What could spark joy for them?',
  'What would you love them to try?',
  'Something peaceful for their soul?',
  'What could ease their mind today?',
  'What might refresh their energy?',
  'Something to inspire their week?',
  'What would nourish them today?',
  'What could make their day lighter?',
  'What would feel like a fresh start?',
  'What might shift their perspective?',
  'A nudge toward something wonderful?',
  'Something small that means a lot?',
  'What could bring them some peace?',
  'A gentle push toward something fun?',
  'What could recharge their spirit?',
  'What would feel like a warm hug?',
  'Something simple that delights them?',
  'What could open up their afternoon?',
  'Something to celebrate their effort?',
  'What would they thank you for later?',
  'What might restore a sense of calm?',
  'Something to awaken their curiosity?',
  'A little kindness for their journey?',
  'What could make today memorable?',
  'Something to reconnect with joy?',
  'What might remind them they matter?',
  'A gift of inspiration for their day?',
];

@Component({
  selector: 'app-suggest-activity-sheet',
  imports: [FormsModule],
  styles: `
    .sheet {
      padding: 0 24px 40px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 500px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .handle {
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.1);
      margin: 12px auto 0;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .sparkle { font-size: 1.4rem; }

    h2 {
      font-size: 1.2rem;
      font-weight: 400;
      color: #444;
      margin: 0;
    }

    h2 strong {
      font-weight: 700;
      color: #2d6b44;
    }

    .textarea-wrap {
      position: relative;
      background: #f4f8f5;
      border-radius: 16px;
      padding: 16px 16px 32px;
    }

    textarea {
      width: 100%;
      border: none;
      background: transparent;
      font-size: 1rem;
      font-family: inherit;
      resize: none;
      outline: none;
      color: #333;
      box-sizing: border-box;
      min-height: 80px;
      line-height: 1.55;
    }

    .char-count {
      position: absolute;
      bottom: 10px;
      right: 14px;
      font-size: 0.75rem;
      color: #ccc;
      transition: color 0.2s;
    }

    .char-count.near-limit { color: #e57373; }

    .chip-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .chip {
      padding: 7px 16px;
      border-radius: 24px;
      border: 1.5px solid rgba(0, 0, 0, 0.1);
      background: white;
      font-size: 0.85rem;
      cursor: pointer;
      color: #777;
      transition: all 0.15s ease;
      font-family: inherit;
      line-height: 1;
    }

    .chip:hover { border-color: rgba(58, 125, 82, 0.4); color: #3a7d52; }

    .chip.selected {
      border-color: #3a7d52;
      background: rgba(58, 125, 82, 0.08);
      color: #3a7d52;
      font-weight: 600;
    }

    .send-btn {
      width: 100%;
      padding: 16px;
      border-radius: 16px;
      border: none;
      background: linear-gradient(135deg, #3a7d52, #4a9462);
      color: white;
      font-size: 1rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
      letter-spacing: 0.03em;
      box-shadow: 0 4px 16px rgba(58, 125, 82, 0.25);
    }

    .send-btn:not(:disabled):active { opacity: 0.85; transform: scale(0.98); }

    .send-btn:disabled {
      background: #ddd;
      box-shadow: none;
      cursor: default;
      color: #aaa;
    }
  `,
  template: `
    <div class="sheet">
      <div class="handle"></div>

      <div class="header">
        <span class="sparkle">✨</span>
        <h2>Let's uplift <strong>{{ friendName }}</strong></h2>
      </div>

      <div class="textarea-wrap">
        <textarea
          maxlength="90"
          [placeholder]="placeholder"
          [ngModel]="$text()"
          (ngModelChange)="$text.set($event)"
          autofocus
        ></textarea>
        <span class="char-count" [class.near-limit]="$text().length > 75">
          {{ $text().length }}/90
        </span>
      </div>

      <div class="chip-row">
        <button
          class="chip"
          [class.selected]="$goalId() === null"
          (click)="$goalId.set(null)"
        >Universal</button>
        @for (g of goalsService.$goals(); track g._id) {
          <button
            class="chip"
            [class.selected]="$goalId() === g._id"
            (click)="$goalId.set(g._id)"
          >{{ g.name }}</button>
        }
      </div>

      <button
        class="send-btn"
        (click)="send()"
        [disabled]="!$text().trim() || $sending()"
      >
        {{ $sending() ? 'Sending…' : 'Send ✦' }}
      </button>
    </div>
  `,
})
export class SuggestActivitySheetComponent {
  #sheetRef = inject(MatBottomSheetRef);
  #snackBar = inject(MatSnackBar);
  #upliftersService = inject(UpliftersService);
  #progressService = inject(ProgressService);
  #suggestionsService = inject(SuggestionsService);
  goalsService = inject(GoalsService);

  friendName = this.#upliftersService.$activeProfileName();
  placeholder = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];

  $text = signal('');
  $goalId = signal<string | null>(null);
  $sending = signal(false);

  send() {
    const text = this.$text().trim();
    if (!text) return;
    const toUserId = this.#upliftersService.$activeProfileId();
    const date = toLocalDateString(this.#progressService.$dailyProgressDate());

    this.$sending.set(true);
    this.#suggestionsService.post(toUserId, date, text, this.$goalId()).subscribe({
      next: (r) => {
        this.$sending.set(false);
        if (r.success) {
          this.#sheetRef.dismiss();
          this.#snackBar.open(`Sent to ${this.friendName}! 🌟`, undefined, { duration: 3000 });
        }
      },
      error: () => this.$sending.set(false),
    });
  }
}
