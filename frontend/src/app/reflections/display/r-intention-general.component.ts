import { Component, inject } from '@angular/core';
import { DailyReflectionService } from '../daily-reflection.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-r-intention-general',
  imports: [MatButton],
  template: `
    <div class="card">
      <div [innerHTML]="intention"></div>
      <br>
      <button
        mat-raised-button
        (click)="
          dailyReflectionService.$currentStep.set('intention-no-goals-2')
        "
      >
        I'm flowing
      </button>
    </div>
  `,
  styles: ``,
})
export class RIntentionGeneralComponent {
  readonly dailyReflectionService = inject(DailyReflectionService);

  intention =
    "Let's take it one step further: <br><br> Close your eyes just for a moment, <br>and <strong>flow with the path of least resistance</strong>, <br>whatever this means for you.";
}
