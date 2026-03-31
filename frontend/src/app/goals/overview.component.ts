import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { GoalsService } from './goals.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HabitProgress } from '@backend/progresses/progress.types';
import { CommonModule, NgClass } from '@angular/common';
import { ProgressService } from '../progresses/progresses.service';
import { ReflectionsService } from '../reflections/reflections.service';
import { DailyProgressComponent } from '../progresses/display/daily-progress.component';
import { ProgressStatsComponent } from '../progresses/display/progress-stats.component';
import { UpliftersService } from '../uplifters/uplifters.service';
import { CommentsService, Comment } from '../comments/comments.service';

// ## wrap every component in div or matcard with card class?
// test
@Component({
  selector: 'app-goals',
  imports: [
    MatIconModule,
    MatButtonModule,
    CommonModule,
    DailyProgressComponent,
    ProgressStatsComponent,
  ],
  template: `

    <div class="flex-row" #flexRow>
      <div #left id="left-side">
        @if (upliftersService.$connections().length > 0) {
          <div class="profile-nav">
            <button
              class="profile-btn"
              [class.active]="!upliftersService.$isViewingUplifter()"
              [style.color]="!upliftersService.$isViewingUplifter() ? todayAccentColor : null"
              [style.border-right-color]="!upliftersService.$isViewingUplifter() ? todayAccentColor : null"
              (click)="switchProfile('')"
            >Me</button>
            @for (c of upliftersService.$connections(); track c._id) {
              <button
                class="profile-btn"
                [class.active]="upliftersService.$activeProfileId() === c._id"
                [style.color]="upliftersService.$activeProfileId() === c._id ? todayAccentColor : null"
                [style.border-right-color]="upliftersService.$activeProfileId() === c._id ? todayAccentColor : null"
                (click)="switchProfile(c._id)"
              >{{ c.name }}</button>
            }
          </div>
        }

        @if (commentsService.$comments().length > 0 && !upliftersService.$isViewingUplifter()) {
          <div class="comments-left">
            @for (comment of $visibleComments(); track comment._id) {
              <div class="comment-card" [attr.data-comment-id]="comment._id" [style.color]="todayAccentColor">
                <div class="comment-from">{{ comment.from_user_name }}</div>
                <div class="comment-text" (click)="toggleComment(comment._id)">
                  @if (expandedCommentId() === comment._id) {
                    {{ comment.text }}
                  } @else {
                    {{ comment.text.length > 60 ? comment.text.slice(0, 60) + '…' : comment.text }}
                  }
                </div>
                <button class="comment-delete" (click)="deleteComment(comment._id)" title="Remove">×</button>
              </div>
            }
            @if (commentsService.$comments().length > $maxVisibleComments() && !showAllComments()) {
              <button class="show-all-btn" [style.color]="todayAccentColor" (click)="showAllComments.set(true)">Show all sweet comments</button>
            }
            @if (showAllComments()) {
              <button class="show-all-btn" [style.color]="todayAccentColor" (click)="hideAllComments()">Hide all comments</button>
            }
          </div>
        }
      </div>

      @if (progressService.$displayDailyProgress()) {
      <app-daily-progress [mobileIntention]="reflectionsService.$reflection()?.intention ?? ''"></app-daily-progress>
      } 
      
      @if (progressService.$displayStats()) {
      <app-progress-stats></app-progress-stats>
      }

      <div #right id="right-side">{{reflectionsService.$reflection()?.intention}}</div>

      <svg class="arrows-overlay" aria-hidden="true">
        @for (path of $arrowPaths(); track $index) {
          <path [attr.d]="path.curve" fill="none" [attr.stroke]="todayAccentColor" stroke-width="1.5" stroke-opacity="0.55" stroke-linecap="round" />
          <circle [attr.cx]="path.endX" [attr.cy]="path.endY" r="2.5" [attr.fill]="todayAccentColor" opacity="0.65" />
        }
      </svg>
    </div>

    <!-- <div style="text-align: center;">
    <p style="color: lightgray; font-size: 0.9em;">
      <i>Author's note: </i> <br>
      To edit Goal & Habits, <br> 
      tap on golden goal name.
      <br> <br>
      Click on habit to mark as done.
    </p>
    </div> -->
  `,
  styles: `
  .completed-habit {
    color: darkgreen;
  }

  .change-day {
    background-color: transparent; /* Removes the background color */
    color: blue;       /* Sets the text color to grey */
    border: none;
    cursor: pointer;
    opacity: 0.8;
  }

  .change-day[disabled] {
  opacity: 0.2; /* 90% transparent */
  cursor: not-allowed; /* change cursor to indicate it's not clickable */
  pointer-events: none;
}

  .flex-row {
    display: flex;
    align-items: flex-start;
    position: relative;
    margin-top: 1px;
    margin-bottom: 1px;
    padding: 0px;
  }

  .arrows-overlay {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    overflow: visible;
  }

  .habit-div {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 7px;
  }

  .head-card {
    flex-direction: row;
    gap: 4px;
    justify-content: center;
    margin-top: 0px;
    margin-bottom: 0px;
  
  }

  .hover-div {
    padding: 10 px;
      font-size: 18px;
      cursor: pointer; /* Changes mouse icon to hand */
  }

  .progress-display {
  padding: 2px 4px;
  margin: 0;
  line-height: 1; /* Remove extra line height spacing */
  height: auto; /* Ensure no extra height */
  }

  #left-side,
#right-side {
  transition: width 0.2s ease;
}

.profile-nav {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding-right: 16px;
  padding-top: 8px;
}

.profile-btn {
  background: none;
  border: none;
  border-right: 2px solid transparent;
  cursor: pointer;
  font-size: 0.85rem;
  color: #aaa;
  padding: 3px 8px;
  text-align: right;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
}

.profile-btn:hover {
  color: #555;
}

.profile-btn.active {
  font-weight: 600;
  border-right: 2px solid;
}

#right-side {
  font-family: 'Caveat', cursive;
  font-size: 1.5rem;
  transform: rotate(-10deg);
  white-space: pre-wrap;
}

.comments-left {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  padding-right: 16px;
  padding-top: 16px;
}

.comment-card {
  position: relative;
  font-family: 'Caveat', cursive;
  font-size: 1.15rem;
  transform: rotate(8deg);
  text-align: right;
  max-width: 140px;
  line-height: 1.3;
}

.comment-from {
  font-size: 0.75rem;
  opacity: 0.6;
  font-family: inherit;
  margin-bottom: 1px;
}

.comment-text {
  cursor: pointer;
  word-break: break-word;
}

.comment-delete {
  position: absolute;
  top: -4px;
  right: -12px;
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}

.comment-delete:hover { color: #e57373; }

.show-all-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  opacity: 0.7;
  padding: 2px 0;
  text-align: right;
  font-family: 'Caveat', cursive;
}
.show-all-btn:hover { opacity: 1; }

@media (max-width: 600px) {
  .flex-row { flex-direction: column; }
  app-daily-progress,
  app-progress-stats { order: 1; width: 100%; }
  #left-side { order: 2; width: 100% !important; display: flex; flex-direction: column; }
  #right-side { display: none; }
  .arrows-overlay { display: none; }

  .comments-left {
    order: 1;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    padding: 8px 16px;
    gap: 8px;
  }
  .comment-card { transform: none; text-align: center; }

  .profile-nav {
    order: 2;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px 16px;
    gap: 4px;
  }
  .profile-btn {
    border-right: none !important;
    border-bottom: 2px solid transparent;
    padding: 4px 12px;
    text-align: center;
  }
  .profile-btn.active { border-bottom: 2px solid; }

  .show-all-btn { text-align: center; width: 100%; }
}

  `,
})
export class OverviewComponent {
  hello = 'world';
  #router = inject(Router);
  readonly goalsService = inject(GoalsService);
  readonly progressService = inject(ProgressService);
  readonly reflectionsService = inject(ReflectionsService);
  readonly upliftersService = inject(UpliftersService);
  readonly commentsService = inject(CommentsService);

  expandedCommentId = signal<string | null>(null);
  showAllComments = signal(false);
  $maxVisibleComments = signal(100);
  $visibleComments = computed(() =>
    this.showAllComments() ? this.commentsService.$comments() : this.commentsService.$comments().slice(0, this.$maxVisibleComments())
  );
  $arrowPaths = signal<{ curve: string; endX: number; endY: number }[]>([]);

  @ViewChild('left') leftDivRef!: ElementRef;
  @ViewChild('right') rightDivRef!: ElementRef;
  @ViewChild('flexRow') flexRowRef!: ElementRef;

  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    this.setupResizeObserver();
  }

setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => this.syncWidths());
    this.resizeObserver.observe(this.leftDivRef.nativeElement);
    this.resizeObserver.observe(this.rightDivRef.nativeElement);

    this.syncWidths(); // initial sync
  }

  syncWidths(): void {
    const leftEl = this.leftDivRef.nativeElement;
    const rightEl = this.rightDivRef.nativeElement;

    leftEl.style.width = 'auto';
    rightEl.style.width = 'auto';

    const maxWidth = Math.max(leftEl.offsetWidth, rightEl.offsetWidth);
    leftEl.style.width = `${maxWidth}px`;
    rightEl.style.width = `${maxWidth}px`;

    this.computeArrows();
    this.computeMaxVisibleComments();
  }

  private _computingCommentLimit = false;

  computeMaxVisibleComments(): void {
    if (this.showAllComments() || this._computingCommentLimit) return;

    const progressEl = document.querySelector('app-daily-progress');
    const leftEl = this.leftDivRef?.nativeElement;
    if (!progressEl || !leftEl) return;

    const availableHeight = progressEl.getBoundingClientRect().height;
    const profileNavEl = leftEl.querySelector('.profile-nav');
    const profileNavHeight = profileNavEl ? profileNavEl.getBoundingClientRect().height : 0;
    const commentsEl: HTMLElement | null = leftEl.querySelector('.comments-left');
    if (!commentsEl) return;

    const availableForComments = availableHeight - profileNavHeight - 24;
    const cards = Array.from(commentsEl.querySelectorAll('.comment-card')) as HTMLElement[];

    let totalH = 0;
    let count = 0;
    for (const card of cards) {
      totalH += card.getBoundingClientRect().height + 10;
      if (totalH <= availableForComments) count++;
      else break;
    }

    const newLimit = Math.max(1, count);
    if (newLimit < this.$maxVisibleComments()) {
      this._computingCommentLimit = true;
      this.$maxVisibleComments.set(newLimit);
      setTimeout(() => { this._computingCommentLimit = false; }, 200);
    }
  }

  computeArrows(): void {
    const container = this.flexRowRef?.nativeElement;
    if (!container || !this.progressService.$displayDailyProgress() || this.upliftersService.$isViewingUplifter()) {
      this.$arrowPaths.set([]);
      return;
    }

    const cr = container.getBoundingClientRect();
    const paths: { curve: string; endX: number; endY: number }[] = [];

    // Fixed x: just inside the left edge of the daily-progress card
    const progressEl = document.querySelector('app-daily-progress');
    if (!progressEl) return;
    const cardX = progressEl.getBoundingClientRect().left - cr.left + 8;

    for (const comment of this.commentsService.$comments()) {
      const commentEl: Element | null = container.querySelector(`[data-comment-id="${comment._id}"]`);
      const habitEl: Element | null = document.querySelector(`[data-habit-id="${comment.habit_id}"]`);
      if (!commentEl || !habitEl) continue;

      const cRect = commentEl.getBoundingClientRect();
      const hRect = habitEl.getBoundingClientRect();

      const x1 = cRect.right - cr.left;
      const y1 = cRect.top + cRect.height / 2 - cr.top;
      const x2 = cardX;
      const y2 = hRect.top + hRect.height / 2 - cr.top;

      const cp = Math.abs(x2 - x1) * 0.45;
      const cx1 = x1 + cp;
      const cx2 = x2 - cp;

      paths.push({
        curve: `M ${x1} ${y1} C ${cx1} ${y1} ${cx2} ${y2} ${x2} ${y2}`,
        endX: x2,
        endY: y2,
      });
    }

    this.$arrowPaths.set(paths);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }


  // ## currentTimeStep and we need another one for DayStep or different components?
  $currentTimeStep = this.progressService.$dailyProgressTimeStep;

  // ####ideax: methods like this: if(condition)navigateTo(path), or findAll(objects)with(condition)
  // signature const function if(condition : boolean)navigateTo(path: string){}

  private dayAccentColorMap: Record<number, string> = {
    0: 'rgb(160, 110, 20)',   // Sunday
    2: 'rgb(120, 45, 0)',     // Tuesday
    3: 'rgb(75, 100, 0)',     // Wednesday
    5: 'rgb(0, 110, 116)',    // Friday
  };
  todayAccentColor = this.dayAccentColorMap[new Date().getDay()] ?? '#222';

  switchProfile(userId: string) {
    this.upliftersService.$activeProfileId.set(userId);
    this.goalsService.update_goals();
  }

  toggleComment(id: string) {
    this.expandedCommentId.update(current => current === id ? null : id);
  }

  deleteComment(id: string) {
    this.commentsService.deleteComment(id).subscribe(r => {
      if (r.success) {
        this.commentsService.$comments.update(cs => cs.filter(c => c._id !== id));
        this.$maxVisibleComments.set(100);
      }
    });
  }

  hideAllComments() {
    this.showAllComments.set(false);
    this.$maxVisibleComments.set(100);
  }

  constructor() {
    if (this.goalsService.$goals().length === 0 && !this.upliftersService.$isViewingUplifter()) {
      this.#router.navigate(['', 'goals', 'add']);
    }

    console.log(this.goalsService.$goals(), 'goals');

    effect(() => {
      this.commentsService.$comments();
      this.progressService.$displayDailyProgress();
      this.progressService.$dailyProgressDate();
      this.upliftersService.$isViewingUplifter();
      setTimeout(() => this.computeArrows(), 80);
    });
  }
}

// if user does not have a reflectionTrigger (stored in mongo) redirect to setup
