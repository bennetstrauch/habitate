import { Component, inject } from '@angular/core';
import { getRandomPhrase } from '../../utils/utils';
import { DailyReflectionService } from '../daily-reflection.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-r-intention-general-2',
  imports: [MatButton],
  template: ` 
  
  <div class="card">
  <div [innerHTML]="intentionInstruction"></div>
  <br>
    <button
      mat-button
      (click)="dailyReflectionService.$currentStep.set('finalize')"
    >
      Something good arrived
      <!-- #could alternate -->
    </button>
    
  </div>
    `,
    

  styles: ``,
})
export class RIntentionGeneral2Component {
  readonly dailyReflectionService = inject(DailyReflectionService);

  manifests = [
    'bubbles up',
    'comes up',
    'arises',
    'appears',
    'shows up',
    'manifests',
    'rises out of the Silence',
  ];

  noResistance = [
    '<br>- just by Being as simple as possible-<br>',
    '<br>',
    '<br>- without pressure to do anything - <br>',
  ];

  intentionInstruction = `Now, <br>close your eyes again, and see ${getRandomPhrase(
    this.noResistance
  )} whether a simple intention for tomorrow ${getRandomPhrase(
    this.manifests
  )}`;
  // #could alternate simple : soft sweet little
  alternative =
    'No resistance, no effort, no strain, <br>just a simple intention that comes up by itself.';
}
