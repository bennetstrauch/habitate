import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterLink } from '@angular/router';
import { GoalsService } from '../goals/goals.service';
import { ProgressService } from '../progresses/progresses.service';
import { ActivatedRoute } from '@angular/router';
import { ReflectionsService } from './reflections.service';
import { Reflection } from '@backend/reflections/reflections.types';
import { getRandomPhrase } from '../utils/utils';

@Component({
  selector: 'app-reflection',
  imports: [MatStepperModule, MatButtonModule, MatCheckboxModule, RouterLink],
  template: `
    <mat-stepper class="card" linear #stepper>
      <mat-step>
        <!-- implement as head component. -->
        <p>
          <strong>{{ $formattedDate() }} - Reflection </strong><br />
          ___________________________<br />
          <br />

          Hello my friend. <br />
          {{myAttitude}} reflect with you today. <br />
        </p>

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      <mat-step>
        <p>Let's take a minute to settle down. <br /></p>

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      <mat-step>
        <p>
          What was <strong>something {{ reflectiveWord }}</strong> today? <br />
        </p>

        <p>Just <strong>relax and see</strong> what bubbles up in your mind</p>

        <!-- #let user enter -->

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      @for(goal of this.goalsService.$goals(); track $index) {
      <!-- #doesnt gt triggered -->
      @if ($index === 0) {
      <p><strong>Let's flow</strong> through your precious goals :)</p>
      }
      <mat-step>
        <p>Intention</p>
        <strong>" {{ goal.name }} "</strong>
        <br />
        <br />

        <button mat-button matStepperNext>Check Habits</button>
      </mat-step>

      @for(habit of goal.habits; track $index) {

      <mat-step>
        <strong>{{ habit.name }}</strong> <br />
        <br />

        @if (habit.latestProgress.completed) { Congratulations! <br />

        Did it feel good? } @else { ---------------- <br />
          <!-- alternate -->
        No worries. <br />
        Just tune in. <br />
        <br />
        What did hold you back from doing it? <br />
        & <br />
        <strong>What simple change</strong> to make it happen with ease
        tomorrow? }
        <br />
        <br />

        <div>
          <button mat-button matStepperNext>Next</button>
        </div>
      </mat-step>
      } }

      <mat-step>
        <p>
          <strong>Thank you</strong> <br />
          for taking the time to take care of yourself. <br />
        </p>
        <div>
          <button mat-button matStepperPrevious>Back</button>

          <button mat-button (click)="completeReflection()">
            Finish Reflection
          </button>
        </div>
      </mat-step>
    </mat-stepper>
  `,
  styles: `
    
    ::ng-deep .mat-horizontal-stepper-header-container {
        display: none !important;
        // removes icons from stepper
    }
`,
})
export class ReflectionComponent {
  #router = inject(Router);
  goalsService = inject(GoalsService);
  reflectionsService = inject(ReflectionsService);

  progressService = inject(ProgressService);

  $formattedDate = signal<string>('');

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // triggers when route parameters changes
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

  completeReflection() {
    if (this.reflectionsService.$reflection()) {
      this.reflectionsService.$reflection()!.completed = true;

      this.reflectionsService
        .put_reflection(this.reflectionsService.$reflection()!)
        .subscribe((response) => {
          if (response.success) {
            console.log('Reflection updated: ', response.data);
          }
          this.#router.navigate(['', 'goals', 'overview']);
        });
    }
  }

  reflectiveWord = getRandomPhrase([
    'good',
    'joyful',
    'sweet',
    'charming',
    'beautiful',
    'insightful',
  ]);

  myAttitude = getRandomPhrase([
    'I am happy to',
    'It is my joy to',
    "It's so cool I get to",
    'What a delight to',
  ]);
}
