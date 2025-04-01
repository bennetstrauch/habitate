import { Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Habit } from '@backend/goals/goals.types';
import { DailyReflectionService } from '../daily-reflection.service';
import { getRandomPhrase } from '../../utils/utils';

@Component({
  selector: 'app-r-habit-incomplete',
  imports: [MatButton],
  template: `
    <div class="card">
      <strong>{{ $habit().name }}</strong> <br />
      ----------------------------------
      <br />
      {{ noShamePhrase }} <br />
      {{ tuneInPhrase }} <br />
      <br />
      <div [innerHTML]="changePhrase"></div>

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

  noShamePhrases = ['No worries.', 'No judgement', 'No problem at all.'];

  tuneInPhrases = [
    'Just tune in',
    'Just feel in',
    'Just relax and feel',
    'Just settle in',
    'Simply relax',
  ];

  changePhrases = [
    '<strong>What simple change</strong> to make it happen with ease tomorrow?',
    'Was there any obstacle holding you back that you could easily overcome tomorrow?',
    'Is there a <strong>soft adjustment</strong> you could make to allow this habit to be integrated tomorrow?'
  ];

  noShamePhrase = getRandomPhrase(this.noShamePhrases);
  tuneInPhrase = getRandomPhrase(this.tuneInPhrases);
  changePhrase = getRandomPhrase(this.changePhrases);
}
