import { Component, inject } from '@angular/core';
import { DisplayGoalWithLinkComponent } from "../../goals/display-goal-with-link.component";
import { NgClass } from '@angular/common';
import { GoalsService } from '../../goals/goals.service';
import { ProgressService } from '../progresses.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-progress-stats',
  imports: [DisplayGoalWithLinkComponent, NgClass, MatButton],
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

          <button mat-button class="progress-display">
              <strong>{{
                progressService.$progressStatsMap().get(habit._id)?.completed ?? 0
              }}</strong>
              <!-- move that in method # -->
              /{{
                habit.frequency 
              }}
            </button>

              {{ habit.name }}
        </div>

      }
    </div>
    <br />
    }  
      
      

  `,
  styleUrls: ['./styles-for-display-progress.scss'],
  styles: `
    .progress-display {
    padding: 2px 4x; /* Minimal padding for content */
    margin: 0;
    line-height: 1; /* Remove extra line height spacing */
    height: auto; /* Ensure no extra height */
    }
  `,
})
export class ProgressStatsComponent {
  goalsService = inject(GoalsService);
  progressService = inject(ProgressService);
}
