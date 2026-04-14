import { Component, inject, OnInit, signal } from '@angular/core';
import { UpliftersService, Uplifter } from '../uplifters/uplifters.service';
import { CommentsService } from './comments.service';
import { ProgressService } from '../progresses/progresses.service';
import { GoalsService } from '../goals/goals.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StandardResponse } from '@backend/types/standardResponse';
import { DailyViewData, Goal } from '@backend/goals/goals.types';
import { HabitProgress } from '@backend/progresses/progress.types';
import { environment } from 'frontend/src/environments/environment';
import { toLocalDateString } from '../utils/utils';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

type Step = 'select' | 'progress' | 'comment' | 'done';

@Component({
  selector: 'app-uplift-friend',
  imports: [MatButtonModule, MatIconModule, FormsModule],
  template: `
    @if (step() === 'select') {
      <div class="section">
        <p class="label">Choose a friend to uplift</p>
        <div class="friend-list">
          @for (c of upliftersService.$connections(); track c._id) {
            <button
              class="friend-btn"
              [class.maxed]="(commentCounts()[c._id] ?? 0) >= 2"
              [disabled]="(commentCounts()[c._id] ?? 0) >= 2"
              (click)="selectFriend(c)"
            >
              {{ c.name }}
              @if (commentCounts()[c._id] !== undefined) {
                <span class="count-badge">{{ commentCounts()[c._id] }} ✦</span>
              }
            </button>
          }
        </div>
      </div>
    }

    @if (step() === 'progress') {
      <div class="section">
        <button mat-button (click)="step.set('select')">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <p class="label">{{ selectedFriend()?.name }}'s habits today — tap one to comment</p>
        @if (friendGoals().length === 0) {
          <p class="muted">No habits found for today.</p>
        }
        @for (goal of friendGoals(); track goal._id) {
          <div class="goal-section">
            <span class="goal-name">{{ goal.name }}</span>
            @for (habit of goal.habits; track habit._id) {
              <button
                class="habit-btn"
                [class.completed]="friendProgressMap().get(habit._id)?.completed"
                (click)="selectHabit(habit._id, habit.name)"
              >
                <mat-icon>{{ friendProgressMap().get(habit._id)?.completed ? 'task_alt' : 'radio_button_unchecked' }}</mat-icon>
                {{ habit.name }}
              </button>
            }
          </div>
        }
      </div>
    }

    @if (step() === 'comment') {
      <div class="section">
        <button mat-button (click)="step.set('progress')">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <p class="label">Comment on <em>{{ selectedHabitName() }}</em></p>
        <textarea
          class="comment-input"
          [(ngModel)]="commentText"
          [maxlength]="120"
          placeholder="Write something encouraging..."
          rows="3"
        ></textarea>
        <div class="char-count">{{ commentText.length }} / 120</div>
        <button
          mat-raised-button
          color="primary"
          [disabled]="!commentText.trim()"
          (click)="submitComment()"
        >Send</button>
      </div>
    }

    @if (step() === 'done') {
      <div class="section done">
        <span>✦ Uplifted!</span>
        <button mat-button (click)="reset()">Uplift another friend</button>
      </div>
    }
  `,
  styles: `
    .section { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
    .label { margin: 0; font-size: 0.85rem; color: #888; }
    .friend-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .friend-btn {
      background: none;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 4px 14px;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .friend-btn:hover:not(:disabled) { background: #f5f5f5; }
    .friend-btn.maxed { opacity: 0.4; cursor: not-allowed; }
    .count-badge { font-size: 0.75rem; color: #aaa; }
    .goal-section { display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px; }
    .goal-name { font-size: 0.8rem; color: #aaa; padding-left: 4px; }
    .habit-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 5px 10px;
      cursor: pointer;
      font-size: 0.9rem;
      text-align: left;
      transition: background 0.15s;
    }
    .habit-btn:hover { background: #f9f9f9; }
    .habit-btn.completed { color: darkgreen; }
    .comment-input {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 8px;
      font-family: inherit;
      font-size: 0.9rem;
      resize: none;
      box-sizing: border-box;
    }
    .char-count { font-size: 0.75rem; color: #bbb; text-align: right; }
    .done { align-items: center; font-size: 1rem; color: #888; }
  `
})
export class UpliftFriendComponent implements OnInit {
  upliftersService = inject(UpliftersService);
  #commentsService = inject(CommentsService);
  #progressService = inject(ProgressService);
  #http = inject(HttpClient);

  step = signal<Step>('select');
  selectedFriend = signal<Uplifter | null>(null);
  friendGoals = signal<Goal[]>([]);
  friendProgressMap = signal<Map<string, HabitProgress>>(new Map());
  selectedHabitId = signal('');
  selectedHabitName = signal('');
  commentText = '';
  commentCounts = signal<Record<string, number>>({});

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    const ids = this.upliftersService.$connections().map(c => c._id);
    if (!ids.length) return;
    const date = toLocalDateString(this.#progressService.$dailyProgressDate());
    this.#commentsService.getCommentCounts(date, ids).subscribe(r => {
      if (r.success) this.commentCounts.set(r.data);
    });
  }

  selectFriend(friend: Uplifter) {
    this.selectedFriend.set(friend);
    this.friendGoals.set([]);
    this.friendProgressMap.set(new Map());
    this.step.set('progress');
    this.loadFriendGoals(friend._id);
  }

  loadFriendGoals(userId: string) {
    const params = new HttpParams().set('forUserId', userId);
    this.#http
      .get<StandardResponse<DailyViewData>>(environment.SERVER_URL + '/daily', { params })
      .subscribe(r => {
        if (r.success) {
          this.friendGoals.set(r.data.goals);
          this.friendProgressMap.set(new Map(r.data.progresses.map(p => [p.habit_id, p])));
        }
      });
  }

  selectHabit(habitId: string, habitName: string) {
    this.selectedHabitId.set(habitId);
    this.selectedHabitName.set(habitName);
    this.commentText = '';
    this.step.set('comment');
  }

  submitComment() {
    const friend = this.selectedFriend();
    if (!friend || !this.commentText.trim()) return;

    const date = toLocalDateString(this.#progressService.$dailyProgressDate());

    this.#commentsService.postComment({
      to_user_id: friend._id,
      habit_id: this.selectedHabitId(),
      habit_name: this.selectedHabitName(),
      date,
      text: this.commentText.trim(),
    }).subscribe(r => {
      if (r.success) {
        this.commentCounts.update(counts => ({
          ...counts,
          [friend._id]: (counts[friend._id] ?? 0) + 1,
        }));
        this.step.set('done');
      }
    });
  }

  reset() {
    this.selectedFriend.set(null);
    this.friendGoals.set([]);
    this.friendProgressMap.set(new Map());
    this.commentText = '';
    this.step.set('select');
  }
}
