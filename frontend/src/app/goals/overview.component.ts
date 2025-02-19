import { Component, computed, inject, signal } from '@angular/core';
import { GoalsService } from './goals.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HabitProgress } from '@backend/progress/progress.types';
import { CommonModule, NgClass } from '@angular/common';
import { ProgressService } from '../progresses/progresses.service';

// ## wrap every component in div or matcard with card class?
// test
@Component({
  selector: 'app-goals',
  imports: [RouterLink, MatIconModule, MatButtonModule, MatIconModule, NgClass, CommonModule],
  template: `

  <!-- maybe change design of head later## -->
    <div class="flex-row">
      <button class="change-day" [disabled]="$currentDayStep()<=-2" (click)="$currentDayStep.set($currentDayStep() - 1)"> 
        <!-- <mat-icon>arrow_circle_left</mat-icon> -->
        <mat-icon>navigate_before</mat-icon>
      </button>
      <div class="card head-card">
        <strong>My</strong> Habitate <strong>{{ $dateToShow() | date:'EEEE' }}</strong>
      </div>
      <button class="change-day" [disabled]="$currentDayStep()>=0" (click)="$currentDayStep.set($currentDayStep() + 1)"> 
        <!-- <mat-icon>arrow_circle_right</mat-icon> -->
        <mat-icon>navigate_next</mat-icon>

    </button>
    </div>

    <div class="card">
      @for (goal of goalsService.$goals(); track $index) {
      <div class="hover-div">
        <div [routerLink]="['', 'goals', goal._id]" style="color: grey;">
          {{ goal.name }}
        </div>

        @for (habit of goal.habits; track $index){

        <div
          class="habit-div"
          [ngClass]="{ 'completed-habit': habit.latestProgress.completed }"
        >
        <!-- ## make like english -->
        @if (! progressService.$displayStats()) {
          <mat-icon (click)="toggleCompleted(habit.latestProgress, habit._id)">
            {{
              habit.latestProgress.completed
                ? 'task_alt'
                : 'radio_button_unchecked'
            }}
          </mat-icon>
        } @else {
          <!-- ## make more readable with let -->
           <button mat-button class="progress-display">
            <strong>{{progressService.$progressStats().get(habit._id)?.completed ?? 0}}</strong>
            <!-- move that in method # -->
            /{{ (((habit.frequency ?? 7)/7) * (progressService.$progressStats().get(habit._id)?.total ?? 0)) | number:'1.0-1' }}

          </button>
        }

          {{ habit.name }}
        </div>

        }
      </div>
      <br />
      }
      <button mat-raised-button [routerLink]="['', 'goals', 'reflection']">
        Start Daily Reflection
      </button>
      <br />
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

  $currentDayStep = signal(0);

  $dateToShow = computed(() => {
    const date = new Date();
    date.setDate(date.getDate() + this.$currentDayStep());

    console.log('dateToShow: ', date);

    this.progressService.mapProgressesForDayToHabits(date);
    return date;
  }
  );


  toggleCompleted(progress: HabitProgress, habitId: string) {

    progress.completed = !progress.completed;

    this.progressService.put_progress(progress).subscribe((response) => {
      if (response.success) {
        console.log('progress updated: ', response.data);
      }
      // ### what if fails, retry or show error?

      // update the Stats-Signal Completed value accordingly
      this.progressService.$progressStats().get(habitId)!.completed += progress.completed ? 1 : -1;
     
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
