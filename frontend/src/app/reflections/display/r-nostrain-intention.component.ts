import { Component, inject } from '@angular/core';
import { DailyReflectionService } from '../daily-reflection.service';

@Component({
  selector: 'app-r-nostrain-intention',
  imports: [],
  template: `
    <div class="card">

      {{ congratulation }}<br />
      {{ question }}<br />
      <br />
      <br />
      <!-- changing the click changes the next step. -->

      <button
        mat-button
        
      >
        No
      </button>


      <button
        mat-button
        (click)="dailyReflectionService.$currentStep.set('finalize')"
      >
        Yes
      </button>
    </div>
  `,
  styles: ``
})
export class RNostrainIntentionComponent {
dailyReflectionService = inject(DailyReflectionService);


}
