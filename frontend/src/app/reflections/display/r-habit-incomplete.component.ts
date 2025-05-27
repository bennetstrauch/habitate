import { Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Habit } from '@backend/goals/goals.types';
import { DailyReflectionService } from '../daily-reflection.service';
import { getRandomPhrase } from '../../utils/utils';
import { ReflectionsService } from '../reflections.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-r-habit-incomplete',
  imports: [MatButton, MatFormField, MatLabel, MatInput],
  template: `
    <div class="card">
      <strong>{{ $habit().name }}</strong> <br />
      ----------------------------------
      <br />
      {{ noShamePhrase }} <br />
      {{ tuneInPhrase }} <br />
      <br />
      <div [innerHTML]="changePhrase"></div>

      <br /> <br>
      <mat-form-field appearance="outline">
        <mat-label>Enter your answer / idea</mat-label>
        <input matInput #userIntention type="text"/>
      </mat-form-field>

      <button
        mat-button
        matStepperNext
        (click)="setIntentionAndProceed(userIntention.value)"
      >
        Next
      </button>
    </div>
  `,
  styles: ``,
})
export class RHabitIncompleteComponent {
  readonly reflectionsService = inject(ReflectionsService);
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

  setIntentionAndProceed(userIntention: string) {
    this.reflectionsService.setIntention(userIntention);
    this.dailyReflectionService.handleNextHabitOrGoal();
  }
}
