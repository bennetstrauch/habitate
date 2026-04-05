import { Component, inject, signal } from '@angular/core';
import { SuggestionRepliesService } from './suggestion-replies.service';

@Component({
  selector: 'app-suggestion-reply-modal',
  imports: [],
  template: `
    @let replies = repliesService.$unseenReplies();
    @if (replies.length > 0) {
      @let reply = replies[$index()];
      <div class="overlay" (click)="close()">
        <div class="card" (click)="$event.stopPropagation()">

          <div class="card-header">
            <span class="label">✦ Feedback received</span>
            @if (replies.length > 1) {
              <span class="counter">{{ $index() + 1 }} / {{ replies.length }}</span>
            }
          </div>

          <div class="sender">{{ reply.from_user_name }}</div>

          <div class="suggestion-context">
            about your suggestion
            <span class="suggestion-text">"{{ reply.suggestion_text }}"</span>
          </div>

          <div class="reply-text">{{ reply.text }}</div>

          <div class="actions">
            @if ($index() < replies.length - 1) {
              <button class="btn-next" (click)="next()">Next →</button>
            } @else {
              <button class="btn-close" (click)="close()">Close</button>
            }
          </div>

        </div>
      </div>
    }
  `,
  styles: `
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.48);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fade-in 0.25s ease;
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .card {
      background: #fff;
      border-radius: 18px;
      padding: 28px 32px 24px;
      max-width: 340px;
      width: calc(100vw - 48px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
      animation: slide-up 0.3s cubic-bezier(0.34, 1.3, 0.64, 1);
    }
    @keyframes slide-up {
      from { transform: translateY(24px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .label {
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #888;
      font-weight: 500;
    }
    .counter {
      font-size: 0.75rem;
      color: #bbb;
    }

    .sender {
      font-size: 1.25rem;
      font-weight: 600;
      color: #222;
      margin-bottom: 10px;
    }

    .suggestion-context {
      font-size: 0.78rem;
      color: #aaa;
      margin-bottom: 4px;
    }
    .suggestion-text {
      display: block;
      font-family: 'Caveat', cursive;
      font-size: 1.05rem;
      color: #888;
      margin-top: 2px;
      margin-bottom: 14px;
    }

    .reply-text {
      font-size: 1rem;
      color: #333;
      line-height: 1.5;
      padding: 12px 14px;
      background: #f9f9f9;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
    }
    .btn-next, .btn-close {
      background: none;
      border: 1.5px solid #ddd;
      border-radius: 8px;
      padding: 7px 18px;
      font-size: 0.9rem;
      cursor: pointer;
      color: #444;
      transition: background 0.15s, border-color 0.15s;
    }
    .btn-next:hover, .btn-close:hover {
      background: #f4f4f4;
      border-color: #bbb;
    }
  `,
})
export class SuggestionReplyModalComponent {
  repliesService = inject(SuggestionRepliesService);
  $index = signal(0);

  next() {
    this.$index.update(i => i + 1);
  }

  close() {
    const ids = this.repliesService.$unseenReplies().map(r => r._id);
    this.repliesService.markSeen(ids);
    this.$index.set(0);
  }
}
