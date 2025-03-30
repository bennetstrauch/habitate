import { Component, inject, input, signal } from '@angular/core';
import { getRandomPhrase } from '../../utils/utils';
import { StateService } from '../../state.service';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { DailyReflectionService } from '../daily-reflection.service';

@Component({
  selector: 'app-r1-welcome',
  imports: [MatButtonModule],
  template: `
    <div class="card">
      <p>
        <strong>{{ $formattedDate() }} - Reflection </strong><br />
        ___________________________<br />
        <br />

        {{ welcomePhrase }} <br />

        {{ myAttitude }} reflect with you today. <br />
      </p>

      <button
        mat-button
        (click)="dailyReflectionService.$currentStep.set('settle-down')"
      >
        Let's go
      </button>
    </div>
  `,
  styles: ``,
})
export class R1WelcomeComponent {
  stateService = inject(StateService);
  readonly dailyReflectionService = inject(DailyReflectionService);
  $formattedDate = signal<string>('');

  constructor(private route: ActivatedRoute) {
    this.setFormattedDateToDisplay();
  }

  setFormattedDateToDisplay() {
    this.route.paramMap.subscribe((params) => {
      const dateString = params.get('date'); // Get ':date' parameter

      if (dateString) {
        const dateObj = new Date(dateString); // Convert string to Date object
        this.$formattedDate.set(
          dateObj.toLocaleDateString('en-CA', {
            weekday: 'short', // e.g., "Mon"
            month: 'short', // e.g., "Feb"
            day: 'numeric', // e.g., "16"
            timeZone: 'UTC', // Use UTC to avoid timezone conversion
          })
        );
      }
    });
  }

  getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  greeting = getRandomPhrase([
    'Hello ',
    'Welcome ',
    'Good ' + this.getTimeOfDayGreeting() + ' ',
    'Good to see you ',
  ]);

  salutation = getRandomPhrase([
    'my friend',
    'dear ' + this.stateService.$state().name + '.',
    'beautiful soul',
  ]);

  welcomePhrase = this.greeting + this.salutation;

  myAttitude = getRandomPhrase([
    'I am happy to',
    'It is my joy to',
    "It's so cool I get to",
    'What a delight to',
  ]);
}
