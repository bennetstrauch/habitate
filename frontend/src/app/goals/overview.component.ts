import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
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

    <div class="flex-row">
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

        @if (commentsService.$comments().length > 0) {
          <div class="comments-left">
            @for (comment of commentsService.$comments(); track comment._id) {
              <div class="comment-card">
                <div class="comment-from">{{ comment.from_user_name }}</div>
                <div class="comment-text" (click)="toggleComment(comment._id)">
                  @if (expandedCommentId() === comment._id) {
                    {{ comment.text }}
                  } @else {
                    {{ comment.text.length > 60 ? comment.text.slice(0, 60) + '…' : comment.text }}
                  }
                </div>
                <div class="comment-habit">↳ {{ comment.habit_name }}</div>
                <button class="comment-delete" (click)="deleteComment(comment._id)" title="Remove">×</button>
              </div>
            }
          </div>
        }
      </div>

      @if (progressService.$displayDailyProgress()) {
      <app-daily-progress></app-daily-progress>
      } 
      
      @if (progressService.$displayStats()) {
      <app-progress-stats></app-progress-stats>
      }

      <div #right id="right-side">{{reflectionsService.$reflection()?.intention}}</div>
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
    // border: 1px solid black;
    display: flex;
    margin-top: 1px;
    margin-bottom: 1px;
    padding: 0px;
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
  padding: 2px 4x; /* Minimal padding for content */
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
  font-size: 1.1rem;
  transform: rotate(8deg);
  text-align: right;
  max-width: 140px;
  color: #777;
  line-height: 1.3;
}

.comment-from {
  font-size: 0.75rem;
  color: #bbb;
  font-family: inherit;
  margin-bottom: 1px;
}

.comment-text {
  cursor: pointer;
  word-break: break-word;
}

.comment-habit {
  font-size: 0.72rem;
  color: #bbb;
  margin-top: 1px;
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

  @ViewChild('left') leftDivRef!: ElementRef;
  @ViewChild('right') rightDivRef!: ElementRef;

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

    // Reset widths first to get accurate natural size
    leftEl.style.width = 'auto';
    rightEl.style.width = 'auto';

    const maxWidth = Math.max(leftEl.offsetWidth, rightEl.offsetWidth);
    leftEl.style.width = `${maxWidth}px`;
    rightEl.style.width = `${maxWidth}px`;
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
      }
    });
  }

  constructor() {
    if (this.goalsService.$goals().length === 0 && !this.upliftersService.$isViewingUplifter()) {
      this.#router.navigate(['', 'goals', 'add']);
    }

    console.log(this.goalsService.$goals(), 'goals');
  }
}

// if user does not have a reflectionTrigger (stored in mongo) redirect to setup
