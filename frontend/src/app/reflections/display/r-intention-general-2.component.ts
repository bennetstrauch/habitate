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
      <br />
      <button
        mat-button
        (click)="handleNextStep()"
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
    '<br>- without any extra effort -<br>',
  ];

  intentionInstruction = `Now, <br>close your eyes ${
    userWasAlreadyAskedToCloseEyes ? 'again' : ''
  }, 
  and see 
  ${getRandomPhrase(this.noResistance)} 
  whether a <strong>simple intention</strong> for today or tomorrow 
  ${getRandomPhrase(this.manifests)}.`;
  // #could alternate simple : soft sweet little


  alternative =
    'No resistance, no effort, no strain, <br>just a simple intention that comes up by itself.';

    handleNextStep() {
      this.dailyReflectionService.$currentStep.set('finalize')
      userWasAlreadyAskedToCloseEyes = false;
      console.log('userWasAlreadyAskedToCloseEyes set to false', userWasAlreadyAskedToCloseEyes);
    }
}

export let userWasAlreadyAskedToCloseEyes = false;

export function setUserWasAlreadyAskedToCloseEyes(value: boolean) {
  userWasAlreadyAskedToCloseEyes = value;
  console.log('userWasAlreadyAskedToCloseEyes set to', value);
}
