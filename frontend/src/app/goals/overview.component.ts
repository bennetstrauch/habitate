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

// ## wrap every component in div or matcard with card class?
// test
@Component({
  selector: 'app-goals',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    DailyProgressComponent,
    ProgressStatsComponent,
  ],
  template: `
   
    <div class="flex-row">
      <div #left id="left-side"></div>

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
  border: 5px solid lightgray;
}

#right-side {
  font-family: 'Caveat', cursive;
  font-size: 1.5rem;
  transform: rotate(-10deg); /* Slight tilt */
  white-space: pre-wrap; /* Preserve line breaks if needed */
}

  `,
})
export class OverviewComponent {
  hello = 'world';
  #router = inject(Router);
  readonly goalsService = inject(GoalsService);
  readonly progressService = inject(ProgressService);
  readonly reflectionsService = inject(ReflectionsService);

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

  constructor() {
    if (this.goalsService.$goals().length === 0) {
      this.#router.navigate(['', 'goals', 'add']);
    }

    console.log(this.goalsService.$goals(), 'goals');
  }
}

// if user does not have a reflectionTrigger (stored in mongo) redirect to setup
