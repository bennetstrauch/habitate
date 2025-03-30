import { Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Habit } from '@backend/goals/goals.types';
import { DailyReflectionService } from '../daily-reflection.service';

@Component({
  selector: 'app-r-habit-incomplete',
  imports: [MatButton],
  template: `
    <div class="card">
      <strong>{{ $habit().name }}</strong> <br />
      ----------------
      <br />
      <!-- #alternate -->
      No worries. <br />
      <!--No judgement,   -->
      Just tune in. <br />
      <!-- Just feel in, Just relax and feel, Just settle in,  -->
      <br />
      <strong>What simple change</strong> to make it happen with ease tomorrow?
      <!-- What did hold you back from doing it?, 
       Is there a soft adjustment you could make to allow this habit to be integrated tomorrow?,

-->
      <br />
      <button
        mat-button
        matStepperNext
        (click)="dailyReflectionService.handleNextHabitOrGoal()"
      >
        Next
      </button>
    </div>
  `,
  styles: ``,
})
export class RHabitIncompleteComponent {
  readonly dailyReflectionService = inject(DailyReflectionService);
  $currentStep = this.dailyReflectionService.$currentStep;

  $habit = computed(() =>
    this.dailyReflectionService.stepsMappedToHabitOrGoal.get(
      this.$currentStep()
    )
  );
}
