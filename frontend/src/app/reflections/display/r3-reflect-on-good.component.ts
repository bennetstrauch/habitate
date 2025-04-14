import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { getRandomPhrase } from '../../utils/utils';
import { DailyReflectionService } from '../daily-reflection.service';

@Component({
  selector: 'app-r3-reflect-on-good',
  imports: [MatButton],
  template: `
    <div class="card">
      <p>
        What was <strong>something {{ reflectiveWord }}</strong> today? <br />
      </p>

      <p>Just <strong>relax and see</strong> what bubbles up in your mind</p>

      <!-- #let user enter -->
      <!-- #change button wording -->
      <button mat-button (click)="handleNextStep()">Next</button>
    </div>
  `,
  styles: ``,
})
export class R3ReflectOnGoodComponent {
  readonly dailyReflectionService = inject(DailyReflectionService);

  reflectiveWord = getRandomPhrase([
    'good',
    'joyful',
    'sweet',
    'charming',
    'beautiful',
    'insightful',
  ]);

  handleNextStep(){
    if (this.dailyReflectionService.stepComponentMap.has('goal-1')) {
    this.dailyReflectionService.$currentStep.set('goal-1');
    } else {
      this.dailyReflectionService.$currentStep.set('no-resistance');
    }
  }
}
