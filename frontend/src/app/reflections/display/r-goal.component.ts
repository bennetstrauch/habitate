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
        ---------------------------
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
