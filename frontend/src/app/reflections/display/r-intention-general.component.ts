import { Component, inject } from '@angular/core';
import { DailyReflectionService } from '../daily-reflection.service';
import { MatButton } from '@angular/material/button';
import {
  setUserWasAlreadyAskedToCloseEyes,
  userWasAlreadyAskedToCloseEyes,
} from './r-intention-general-2.component';

@Component({
  selector: 'app-r-no-resistance',
  imports: [MatButton],
  template: `
    <div class="card">
      <div [innerHTML]="intention"></div>
      <br />
      <button mat-raised-button (click)="handleNextStep()">I'm flowing</button>
    </div>
  `,
  styles: ``,
})
export class RNoResistance {
  readonly dailyReflectionService = inject(DailyReflectionService);

  intention =
    "Let's take it one step further: <br><br> Close your eyes just for a moment, <br>and <strong>flow with the path of least resistance</strong>, <br>whatever this means for you.";

  handleNextStep() {
    this.dailyReflectionService.$currentStep.set('intention-general');
    setUserWasAlreadyAskedToCloseEyes(true);
  }
}
