import { Component, computed, inject, input } from '@angular/core';
import { Habit } from '@backend/goals/goals.types';
import { getRandomPhrase } from '../../utils/utils';
import { MatButton } from '@angular/material/button';
import { DailyReflectionService } from '../daily-reflection.service';

@Component({
  selector: 'app-r-habit-completed',
  imports: [MatButton],
  template: `
    <div class="card">
      <strong>{{ $habit().name }}</strong> <br />
      <br />

      {{ congratulation }}<br />
      {{ question }}<br />
      <br />
      <br />
      <!-- changing the click changes the next step. -->
      <button
        mat-button
        (click)="dailyReflectionService.handleNextHabitOrGoal()"
      >
        Next
      </button>
    </div>
  `,
  styles: ``,
})
export class RHabitCompletedComponent {
  dailyReflectionService = inject(DailyReflectionService);

  $currentStep = this.dailyReflectionService.$currentStep;

  $habit = computed(() =>
    this.dailyReflectionService.stepsMappedToHabitOrGoal.get(
      this.$currentStep()
    )
  );

  congratulations = [
    'Congratulations!',
    'You did it!',
    'Status: Completed!',
    'Da daa da done!',
  ];

  completedQuestions = [
    'Did it feel good?',
    'Did it lift you up?',
    'Did you feel more balanced after?',
    'Did it bring you joy?',
    'Did you feel more centered after?',
    'Did you feel energized after?',
  ];

  congratulation = getRandomPhrase(this.congratulations);
  question = getRandomPhrase(this.completedQuestions);
}
