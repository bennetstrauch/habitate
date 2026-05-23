import { Component, inject, input, signal } from '@angular/core';
import { CommentsService, UnseenDateEntry } from './comments.service';
import { ProgressService } from '../progresses/progresses.service';
import { UpliftersService } from '../uplifters/uplifters.service';
import { toLocalDateString } from '../utils/utils';

@Component({
  selector: 'app-comment-inbox-bar',
  template: `
    @if (commentsService.$datesWithUnseenComments().length > 0) {
      <div class="inbox-bar" [style.color]="accentColor()">
        <button class="inbox-toggle" (click)="$expanded.set(!$expanded())">
          <span class="inbox-label">✦ New comments</span>
          <span class="inbox-count">{{ commentsService.$datesWithUnseenComments().length }}</span>
          <span class="inbox-chevron">{{ $expanded() ? '▲' : '▼' }}</span>
        </button>
        @if ($expanded()) {
          <div class="inbox-rows">
            @for (entry of commentsService.$datesWithUnseenComments(); track entry.date) {
              <button class="inbox-row" (click)="navigateTo(entry)">
                <span class="inbox-date">{{ label(entry.date) }}</span>
                <span class="inbox-from">{{ entry.from.join(', ') }}</span>
              </button>
            }
          </div>
        }
      </div>
    }
  `,
  styles: `
    .inbox-bar {
      width: 100%;
      border-bottom: 1px solid currentColor;
      margin-bottom: 4px;
    }

    .inbox-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      cursor: pointer;
      width: 100%;
      padding: 6px 16px;
      color: inherit;
      font-size: 0.82rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      transition: opacity 0.15s;
    }

    .inbox-toggle:hover { opacity: 0.7; }

    .inbox-label { flex: 1; text-align: left; }

    .inbox-count {
      border: 1px solid currentColor;
      border-radius: 10px;
      padding: 0 5px;
      font-size: 0.7rem;
      font-weight: 700;
      line-height: 1.6;
    }

    .inbox-chevron { opacity: 0.55; font-size: 0.65rem; }

    .inbox-rows {
      display: flex;
      flex-direction: column;
      padding: 0 0 6px;
    }

    .inbox-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 20px;
      color: inherit;
      text-align: left;
      width: 100%;
      opacity: 0.75;
      transition: opacity 0.15s;
    }

    .inbox-row:hover { opacity: 1; }

    .inbox-date { font-size: 0.8rem; font-weight: 700; min-width: 72px; }
    .inbox-from { font-size: 0.77rem; opacity: 0.8; font-style: italic; }
  `,
})
export class CommentInboxBarComponent {
  protected readonly commentsService = inject(CommentsService);
  readonly #progressService = inject(ProgressService);
  readonly #upliftersService = inject(UpliftersService);

  readonly accentColor = input<string>('#222');
  $expanded = signal(false);

  label(dateStr: string): string {
    const today = toLocalDateString(new Date());
    const yesterday = toLocalDateString(new Date(Date.now() - 86400000));
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  navigateTo(entry: UnseenDateEntry) {
    const today = toLocalDateString(new Date());
    const offset = Math.round((new Date(entry.date).getTime() - new Date(today).getTime()) / 86400000);
    this.#upliftersService.$activeProfileId.set('');
    this.commentsService.markSeenImmediatelyOnNextLoad();
    this.#progressService.$dailyProgressTimeStep.set(offset);
    this.#progressService.loadDailyView().subscribe();
    this.$expanded.set(false);
  }
}
