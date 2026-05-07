import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { GoalsService } from './goals.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProgressService } from '../progresses/progresses.service';
import { ReflectionsService } from '../reflections/reflections.service';
import { DailyProgressComponent } from '../progresses/display/daily-progress.component';
import { ProgressStatsComponent } from '../progresses/display/progress-stats.component';
import { DateHeaderWithTimestepComponent } from '../progresses/display/date-header-with-timestep.component';
import { UpliftersService } from '../uplifters/uplifters.service';
import { CommentsService } from '../comments/comments.service';
import { CommentInboxBarComponent } from '../comments/comment-inbox-bar.component';

@Component({
  selector: 'app-goals',
  imports: [
    MatIconModule,
    MatButtonModule,
    DailyProgressComponent,
    ProgressStatsComponent,
    DateHeaderWithTimestepComponent,
    CommentInboxBarComponent,
  ],
  template: `
    @if (progressService.$displayDailyProgress()) {
      <app-comment-inbox-bar [accentColor]="todayAccentColor" />
      <app-date-header-with-timestep
        [$currentTimeStep]="progressService.$dailyProgressTimeStep"
        [$dateOrDateRangeToShow]="progressService.$dateToShow()"
      ></app-date-header-with-timestep>
    }

    <div class="flex-row" #flexRow>
      @if (upliftersService.$connections().length > 0) {
        <div class="profile-nav-wrapper" [class.spotlight-dim]="$dimProfileNav()">
          <div class="profile-nav" [class.tour-highlight]="$upliftersTourStep() === 'switcher'">
            <button
              class="profile-btn"
              [class.active]="!upliftersService.$isViewingUplifter()"
              [style.color]="todayAccentColor"
              (click)="switchProfile('')"
            >Me</button>
            @for (c of upliftersService.$connections(); track c._id) {
              <button
                class="profile-btn"
                [class.active]="upliftersService.$activeProfileId() === c._id"
                [style.color]="todayAccentColor"
                (click)="switchProfile(c._id)"
              >{{ c.name }}</button>
            }
          </div>
        </div>
      }

      <div #left id="left-side">
        @if (commentsService.$comments().length > 0 && !upliftersService.$isViewingUplifter()) {
          <div class="comments-left">
            @for (comment of commentsService.$comments(); track comment._id) {
              <div
                class="comment-card"
                [class.comment-new]="!comment.seen"
                [attr.data-comment-id]="comment._id"
                [style.color]="todayAccentColor"
              >
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
          </div>
        }
      </div>

      @if (progressService.$displayDailyProgress()) {
        <app-daily-progress
          [mobileIntention]="reflectionsService.$displayedIntention() ?? ''"
          [class.spotlight-dim]="$dimContent()"
          [class.tour-highlight]="$upliftersTourStep() === 'activity'"
        ></app-daily-progress>
      }

      @if (progressService.$displayStats()) {
        <app-progress-stats [class.spotlight-dim]="$dimContent()"></app-progress-stats>
      }

      <div #right id="right-side" [class.spotlight-dim]="$dimOther()">{{ reflectionsService.$displayedIntention() }}</div>

      <svg class="arrows-overlay" aria-hidden="true" [class.spotlight-dim]="$dimOther()">
        @for (path of $arrowPaths(); track $index) {
          <path [attr.d]="path.curve" fill="none" [attr.stroke]="todayAccentColor" stroke-width="1.5" stroke-opacity="0.55" stroke-linecap="round" />
          <circle [attr.cx]="path.endX" [attr.cy]="path.endY" r="2.5" [attr.fill]="todayAccentColor" opacity="0.65" />
        }
      </svg>
    </div>
  `,
  styles: `
    .flex-row {
      display: flex;
      align-items: flex-start;
      position: relative;
      margin-top: 1px;
      margin-bottom: 1px;
      padding: 0;
    }

    .arrows-overlay {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      overflow: visible;
    }

    #left-side,
    #right-side {
      transition: width 0.2s ease;
    }

    #left-side {
      align-self: stretch;
      max-height: 70vh;
      overflow-y: auto;
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
      padding: 3px 8px;
      text-align: right;
      transition: opacity 0.15s;
      white-space: nowrap;
      opacity: 0.38;
    }

    .profile-btn:hover { opacity: 0.65; }

    .profile-btn.active {
      font-weight: 600;
      border-right: 2px solid;
      opacity: 1;
    }

    #right-side {
      font-family: 'Caveat', cursive;
      font-size: 1.5rem;
      transform: rotate(-10deg);
      white-space: pre-wrap;
      align-self: stretch;
      display: flex;
      align-items: center;
      justify-content: center;
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

    @keyframes comment-glow {
      0%   { filter: drop-shadow(0 0 0px currentColor); }
      30%  { filter: drop-shadow(0 0 7px currentColor); }
      100% { filter: drop-shadow(0 0 0px currentColor); }
    }

    .comment-new {
      animation: comment-glow 4.5s ease-out 1 forwards;
    }

    .comment-from {
      font-size: 0.75rem;
      opacity: 0.6;
      font-family: inherit;
      margin-bottom: 1px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
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

    .profile-nav-wrapper, .profile-nav, app-daily-progress, app-progress-stats, #right-side, .arrows-overlay {
      transition: filter 0.8s ease, box-shadow 0.4s ease;
    }

    .spotlight-dim { filter: brightness(0.45); }

    .tour-highlight {
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.55), 0 0 20px rgba(255, 255, 255, 0.2);
      border-radius: 6px;
    }

    @media (max-width: 600px) {
      .flex-row {
        flex-direction: column;
        padding-bottom: 80px;
      }

      .profile-nav-wrapper { order: 0; width: 100%; }
      app-daily-progress,
      app-progress-stats { order: 1; width: 100%; }
      #left-side {
        order: 2;
        width: 100% !important;
        display: flex;
        flex-direction: column;
        max-height: none;
      }
      #right-side { display: none; }
      .arrows-overlay { display: none; }

      .comments-left {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: flex-start;
        padding: 8px 16px;
        gap: 8px;
      }
      .comment-card { transform: none; text-align: center; }

      .profile-nav {
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
      .profile-btn.active { border-right: none !important; border-bottom: 2px solid; }
    }
  `,
})
export class OverviewComponent {
  #router = inject(Router);
  readonly goalsService = inject(GoalsService);
  readonly progressService = inject(ProgressService);
  readonly reflectionsService = inject(ReflectionsService);
  readonly upliftersService = inject(UpliftersService);
  readonly commentsService = inject(CommentsService);

  #refreshInterval: ReturnType<typeof setInterval> | null = null;
  $upliftersTourStep = signal<'switcher' | 'activity' | null>(null);
  #upliftersTourTimer: ReturnType<typeof setTimeout> | null = null;

  $dimProfileNav = computed(() => this.$upliftersTourStep() === 'activity');
  $dimContent    = computed(() => this.$upliftersTourStep() === 'switcher');
  $dimOther      = computed(() => this.$upliftersTourStep() !== null);

  expandedCommentId = signal<string | null>(null);
  $arrowPaths = signal<{ curve: string; endX: number; endY: number }[]>([]);

  @ViewChild('left') leftDivRef!: ElementRef;
  @ViewChild('right') rightDivRef!: ElementRef;
  @ViewChild('flexRow') flexRowRef!: ElementRef;

  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.syncWidths());
    this.resizeObserver.observe(this.leftDivRef.nativeElement);
    this.resizeObserver.observe(this.rightDivRef.nativeElement);
    this.syncWidths();
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
  }

  computeArrows(): void {
    const container = this.flexRowRef?.nativeElement;
    if (!container || !this.progressService.$displayDailyProgress() || this.upliftersService.$isViewingUplifter()) {
      this.$arrowPaths.set([]);
      return;
    }

    const cr = container.getBoundingClientRect();
    const progressEl = document.querySelector('app-daily-progress');
    if (!progressEl) return;

    const cardX = progressEl.getBoundingClientRect().left - cr.left + 8;
    const paths: { curve: string; endX: number; endY: number }[] = [];

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
      paths.push({
        curve: `M ${x1} ${y1} C ${x1 + cp} ${y1} ${x2 - cp} ${y2} ${x2} ${y2}`,
        endX: x2,
        endY: y2,
      });
    }

    this.$arrowPaths.set(paths);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.#refreshInterval) clearInterval(this.#refreshInterval);
    if (this.#upliftersTourTimer) clearTimeout(this.#upliftersTourTimer);
  }

  private readonly dayAccentColorMap: Record<number, string> = {
    0: 'rgb(160, 110, 20)',
    2: 'rgb(120, 45, 0)',
    3: 'rgb(75, 100, 0)',
    4: 'rgb(180, 55, 0)',
    5: 'rgb(0, 110, 116)',
    6: 'rgb(10, 70, 150)',
  };
  readonly todayAccentColor = this.dayAccentColorMap[new Date().getDay()] ?? '#222';

  switchProfile(userId: string) {
    if (this.$upliftersTourStep() === 'switcher' && userId !== '') {
      this.$upliftersTourStep.set('activity');
      if (this.#upliftersTourTimer) clearTimeout(this.#upliftersTourTimer);
      this.#upliftersTourTimer = setTimeout(() => {
        this.$upliftersTourStep.set(null);
        this.upliftersService.markUpliftersTourSeen();
      }, 4000);
    }
    this.upliftersService.$activeProfileId.set(userId);
    this.progressService.$dailyProgressTimeStep.set(0);
    this.progressService.loadDailyView().subscribe();
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
    effect(() => {
      const isViewing = this.upliftersService.$isViewingUplifter();
      this.upliftersService.$activeProfileId();

      if (this.#refreshInterval) {
        clearInterval(this.#refreshInterval);
        this.#refreshInterval = null;
      }

      if (isViewing) {
        this.#refreshInterval = setInterval(() => {
          if (this.progressService.$dailyProgressTimeStep() === 0) {
            this.progressService.loadDailyView().subscribe();
          }
        }, 60_000);
      }
    });

    if (this.goalsService.$goals().length === 0 && !this.upliftersService.$isViewingUplifter()) {
      this.#router.navigate(['', 'goals', 'add']);
    }

    effect(() => {
      this.commentsService.$comments();
      this.progressService.$displayDailyProgress();
      this.progressService.$dailyProgressDate();
      this.upliftersService.$isViewingUplifter();
      setTimeout(() => this.computeArrows(), 80);
    });

    effect(() => {
      const connections = this.upliftersService.$connections();
      if (connections.length > 0 && !this.upliftersService.$upliftersTourSeen()) {
        this.$upliftersTourStep.set('switcher');
      }
    });
  }
}
