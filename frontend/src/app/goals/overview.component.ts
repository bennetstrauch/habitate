import { Component, computed, inject, signal } from '@angular/core';
import { GoalsService } from './goals.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HabitProgress } from '@backend/progresses/progress.types';
import { CommonModule, NgClass } from '@angular/common';
import { ProgressService } from '../progresses/progresses.service';
import { formatDateRangeToDisplay, toLocalDateString } from '../utils/utils';
import { ReflectionsService } from '../reflections/reflections.service';
import { DailyProgressComponent } from '../progresses/display/daily-progress.component';
import { ProgressStatsComponent } from '../progresses/display/progress-stats.component';
import { DisplayGoalWithLinkComponent } from './display-goal-with-link.component';
import { DateHeaderWithTimestepComponent } from "../progresses/display/date-header-with-timestep.component";

// ## wrap every component in div or matcard with card class?
// test
@Component({
  selector: 'app-goals',
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatIconModule,
    NgClass,
    CommonModule,
    DailyProgressComponent,
    ProgressStatsComponent,
    DisplayGoalWithLinkComponent,
    DateHeaderWithTimestepComponent
],
  template: `

    <app-date-header-with-timestep [$currentTimeStep]="progressService.$currentTimeStep"/>

    <div class="card">
      @if (progressService.$displayDailyProgress()) {

        <!-- <app-date-header-with-timestep [$currentTimeStep]="progressService.$currentTimeStep"/> -->

      <app-daily-progress></app-daily-progress>
      } @if (progressService.$displayStats()) {

      <app-progress-stats></app-progress-stats>
      }
    </div>
  
  `,
  styles: `
  .completed-habit {
    color: darkgreen;
  }

  .change-day {
    background-color: transparent; /* Removes the background color */
    color: blue;       /* Sets the text color to grey */
    // font-weight: bold;
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

  `,
})
export class OverviewComponent {
  #router = inject(Router);
  readonly goalsService = inject(GoalsService);
  readonly progressService = inject(ProgressService);
  readonly reflectionsService = inject(ReflectionsService);

  // ## currentTimeStep and we need another one for DayStep or different components?
  $currentTimeStep = this.progressService.$currentTimeStep;


  toggleCompleted(progress: HabitProgress, habitId: string) {
    progress.completed = !progress.completed;

    this.progressService.put_progress(progress).subscribe((response) => {
      if (response.success) {
        console.log('progress updated: ', response.data);
      }
      // ### what if fails, retry or show error?

      // update the Stats-Signal Completed value accordingly
      this.progressService.$progressStatsMap().get(habitId)!.completed +=
        progress.completed ? 1 : -1;
    });
  }

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
