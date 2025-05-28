import { Component, inject } from '@angular/core';
import { getRandomPhrase } from '../../utils/utils';
import { DailyReflectionService } from '../daily-reflection.service';
import { MatButton } from '@angular/material/button';
import { ReflectionsService } from '../reflections.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-r-intention-general-2',
  imports: [MatButton, MatFormField, MatLabel, MatInput],
  template: `
    <div class="card">
      <div [innerHTML]="intentionInstruction"></div>
     
      <br /> <br> <br/> 
      <mat-form-field appearance="outline">
        <mat-label>your sweet intention</mat-label>
        <!-- could alternate lable as well # -->
        <input matInput #userIntention type="text"/>
      </mat-form-field>

      <button
        mat-button
        matStepperNext
        (click)="setIntentionAndProceed(userIntention.value)"
      >
        Something good arrived
        <!-- #could alternate -->
      </button>
    </div>
  `,

  styles: ``,
})
export class RIntentionGeneral2Component {
  readonly reflectionsService = inject(ReflectionsService);
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
  }, <br>
  and see <br>
  <i>${getRandomPhrase(this.noResistance)}</i>
  whether a <strong>simple intention</strong> for today or tomorrow 
  ${getRandomPhrase(this.manifests)}.`;
  // #could alternate simple : soft sweet little


  alternative =
    'No resistance, no effort, no strain, <br>just a simple intention that comes up by itself.';

    handleNextStep() {
     
      console.log('userWasAlreadyAskedToCloseEyes set to false', userWasAlreadyAskedToCloseEyes);
    }

      setIntentionAndProceed(userIntention: string) {
    this.reflectionsService.setIntention(userIntention);

     this.dailyReflectionService.$currentStep.set('finalize')
      userWasAlreadyAskedToCloseEyes = false;
  }
}

export let userWasAlreadyAskedToCloseEyes = false;

export function setUserWasAlreadyAskedToCloseEyes(value: boolean) {
  userWasAlreadyAskedToCloseEyes = value;
  console.log('userWasAlreadyAskedToCloseEyes set to', value);
}
