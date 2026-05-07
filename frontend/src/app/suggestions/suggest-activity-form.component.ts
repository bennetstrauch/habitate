import { Component, effect, inject, signal } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { UpliftersService } from '../uplifters/uplifters.service';
import { ProgressService } from '../progresses/progresses.service';
import { SuggestionsService } from './suggestions.service';
import { SuggestActivitySheetComponent } from './suggest-activity-sheet.component';
import { toLocalDateString } from '../utils/utils';
import { getTodayGoalColor } from '../goals/goal-day-color';

const ADJECTIVES = ['uplifting', 'useful', 'encouraging', 'joyful', 'blissful', 'productive'];

@Component({
  selector: 'app-suggest-activity-form',
  styles: `
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
    .cta-action::after { content: ' →'; font-size: 1.25em; font-weight: 400; opacity: 0.5; margin-left: 6px; }
    .cta-action:active { opacity: 0.7; }
    .suggest-done-bar { color: #aaa; cursor: default; }

    @media (max-width: 600px) {
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
  `,
  template: `
    @if (suggestionsService.$hasSent()) {
      <div class="reflection-cta-bar suggest-done-bar">Activity suggested ✓</div>
    } @else {
      <button
        class="reflection-cta-bar cta-action"
        [style.--bar-color]="todayBarColor"
        (click)="openSheet()"
      >
        Suggest {{ $adjective() }} activity
      </button>
    }
  `,
})
export class SuggestActivityFormComponent {
  suggestionsService = inject(SuggestionsService);
  #upliftersService = inject(UpliftersService);
  #progressService = inject(ProgressService);
  #bottomSheet = inject(MatBottomSheet);

  todayBarColor = getTodayGoalColor();
  $adjective = signal(ADJECTIVES[0]);

  constructor() {
    effect(() => {
      const toUserId = this.#upliftersService.$activeProfileId();
      const date = toLocalDateString(this.#progressService.$dailyProgressDate());
      this.$adjective.set(ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]);
      this.suggestionsService.checkSentToUser(toUserId, date);
    });
  }

  openSheet() {
    this.#bottomSheet.open(SuggestActivitySheetComponent, {
      panelClass: 'suggest-sheet-panel',
    });
  }
}
