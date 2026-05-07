import { Component, inject, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ActivitySuggestion } from '@backend/suggestions/suggestions.types';
import { SuggestionsService } from './suggestions.service';
import { SuggestionRepliesService } from '../suggestion-replies/suggestion-replies.service';

@Component({
  selector: 'app-accepted-suggestion-item',
  imports: [NgClass, MatIcon, MatButton, FormsModule],
  styleUrls: ['../progresses/display/styles-for-display-progress.scss'],
  styles: `
    .suggestion-habit .habit-text { color: #5a8a5a; }
    .suggestion-habit .habit-check { border-color: rgba(90, 138, 90, 0.35); }
    .sparkle { font-size: 14px; opacity: 0.6; flex-shrink: 0; }
    .habit-div:hover { background: rgba(255, 255, 255, 0.35); }
    .habit-div:active { transform: scale(0.985); }
    .habit-div.completed-habit .habit-text {
      text-decoration: line-through;
      text-decoration-thickness: 1.5px;
      text-decoration-color: rgba(58, 125, 82, 0.4);
    }

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
    .reply-actions { display: flex; align-items: center; gap: 4px; }
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
  template: `
    <div
      class="habit-div suggestion-habit"
      [ngClass]="{ 'completed-habit': suggestion().completed }"
      (click)="toggle()"
      [style.cursor]="readonly() ? 'default' : 'pointer'"
    >
      <div class="habit-check" [class.completed]="suggestion().completed"></div>
      <mat-icon class="sparkle">auto_awesome</mat-icon>
      <span class="habit-text">{{ suggestion().text }}</span>
    </div>
    @if ($replyOpen()) {
      <div class="suggestion-reply">
        <textarea
          class="reply-textarea"
          maxlength="120"
          [placeholder]="'Tell ' + suggestion().from_user_name + ' how it went…'"
          [ngModel]="$replyText()"
          (ngModelChange)="$replyText.set($event)"
        ></textarea>
        <div class="reply-actions">
          <button mat-button (click)="sendReply()">Send</button>
          <button class="reply-dismiss" (click)="dismissReply()">×</button>
        </div>
      </div>
    }
  `,
})
export class AcceptedSuggestionItemComponent {
  readonly suggestion = input.required<ActivitySuggestion>();
  readonly readonly = input(false);

  #suggestionsService = inject(SuggestionsService);
  #repliesService = inject(SuggestionRepliesService);

  $replyOpen = signal(false);
  $replyText = signal('');

  toggle() {
    if (this.readonly()) return;
    const s = this.suggestion();
    const newCompleted = !s.completed;
    this.#suggestionsService.$acceptedSuggestions.update(
      list => list.map(x => x._id === s._id ? { ...x, completed: newCompleted } : x)
    );
    this.#suggestionsService.toggleCompleted(s._id, newCompleted).subscribe();
    if (newCompleted) {
      this.$replyOpen.set(true);
      this.$replyText.set('');
    } else {
      this.dismissReply();
    }
  }

  sendReply() {
    const text = this.$replyText().trim();
    if (!text) { this.dismissReply(); return; }
    this.#repliesService.postReply(this.suggestion()._id, text)
      .subscribe(r => { if (r.success) this.dismissReply(); });
  }

  dismissReply() {
    this.$replyOpen.set(false);
    this.$replyText.set('');
  }
}
