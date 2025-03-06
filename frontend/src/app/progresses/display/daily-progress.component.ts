import { Component, inject } from '@angular/core';
import { DateHeaderWithTimestepComponent } from './date-header-with-timestep.component';
import { GoalsService } from '../../goals/goals.service';
import { DisplayGoalWithLinkComponent } from '../../goals/display-goal-with-link.component';
import { NgClass } from '@angular/common';
import { ProgressService } from '../progresses.service';
import { MatIcon } from '@angular/material/icon';
import { HabitProgress } from '@backend/progresses/progress.types';
import { RouterLink } from '@angular/router';
import { ReflectionsService } from '../../reflections/reflections.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-daily-progress',
  imports: [
    DisplayGoalWithLinkComponent,
    NgClass,
    MatIcon,
    RouterLink,
    MatButton,
  ],
  template: `
    @for (goal of goalsService.$goals(); track $index) {
    <div class="hover-div">
      <app-display-goal-with-link [goalId]="goal._id" [goalName]="goal.name" />

      @for (habit of goal.habits; track $index){ @let progress =
      habit.latestProgress;

      <div
        class="habit-div"
        [ngClass]="{ 'completed-habit': progress.completed }"
      >
        <!-- ## make like english -->
        <mat-icon (click)="toggleCompleted(progress, habit._id)">
          {{ progress.completed ? 'task_alt' : 'radio_button_unchecked' }}
        </mat-icon>

        {{ habit.name }}
      </div>

      }
    </div>
    <br />
    } @if(reflectionsService.$reflection()?.completed){
    <!-- no need for copleted habit and maybe habit-div if button is left in there  -->
    <!-- # redo? then with alert -->
    <div class="completed-habit habit-div">
      <button mat-raised-button>
        <mat-icon> task_alt </mat-icon>
        <strong> Reflection Completed :) </strong>
      </button>
    </div>

    } @if(!reflectionsService.$reflection()?.completed){

    <button
      mat-raised-button
      [routerLink]="[
        '',
        'goals',
        'reflection',
        progressService.$dailyProgressDate().toISOString().split('T')[0]
      ]"
    >
      Start Daily Reflection
    </button>
    <br />
    }
  `,
  styleUrls: ['./styles-for-display-progress.scss'],
  styles: ``,
})
export class DailyProgressComponent {
  goalsService = inject(GoalsService);
  progressService = inject(ProgressService);
  reflectionsService = inject(ReflectionsService);

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
}
