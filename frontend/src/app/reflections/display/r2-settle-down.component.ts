import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { DailyReflectionService } from '../daily-reflection.service';

@Component({
  selector: 'app-r2-settle-down',
  imports: [MatButton],
  template: `
  <!-- ##wrap in div in parent -->
  <div class="card">
     <p>Let's take a minute to settle down. <br /></p>

<button mat-raised-button
(click)="dailyReflectonService.$currentStep.set('reflect-on-good')"
>I took my time</button>
</div>
  `,
  styles: ``
})
export class R2SettleDownComponent {
dailyReflectonService = inject(DailyReflectionService);
}
