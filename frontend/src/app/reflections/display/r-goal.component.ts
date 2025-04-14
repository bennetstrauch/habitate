import { Component, computed, inject, input } from '@angular/core';
import { DailyReflectionService } from '../daily-reflection.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-r-goal',
  imports: [MatButton],
  template: `
    <div class="card">
      @if ($currentStep()=='goal-1') {
      <p>
        <strong>Let's flow</strong> through your precious goals :) <br />
        <br />

        <svg
          width="100%"
          height="20"
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          style="opacity: 0.2;"
        >
          <path
            d="M0,10 
           Q5,0 10,10 
           T20,10 
           T30,10 
           T40,10 
           T50,10 
           T60,10 
           T70,10 
           T80,10 
           T90,10 
           T100,10"
            stroke="black"
            fill="transparent"
            stroke-width="1"
          />
        </svg>
      </p>

      }

      <p>Intention</p>
      <strong>" {{ $goal().name }} "</strong>
      <br />
      <br />

      <button mat-button (click)="handleNextHabit()">Check Habit</button>
    </div>
  `,
  styles: ``,
})
export class RGoalComponent {
  dailyReflectionService = inject(DailyReflectionService);
  $currentStep = this.dailyReflectionService.$currentStep;

  $goal = computed(() =>
    this.dailyReflectionService.stepsMappedToHabitOrGoal.get(
      this.$currentStep()
    )
  );

  handleNextHabit() {
    let currentStep = this.$currentStep();
    let nextHabit = currentStep + '-habit-1';

    this.dailyReflectionService.$currentStep.set(nextHabit);
  }
}
