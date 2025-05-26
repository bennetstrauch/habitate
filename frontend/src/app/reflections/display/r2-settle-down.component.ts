import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgStyle, NgIf } from '@angular/common';
import { DailyReflectionService } from '../daily-reflection.service';

@Component({
  selector: 'app-r2-settle-down',
  standalone: true,
  imports: [MatButtonModule, NgStyle, NgIf],
  template: `
    <div class="card">
      <p>Let's take a minute to settle down.<br /></p>

      <!-- <div class="timer-icon" [ngStyle]="{
        'border-color': interpolatedColor(),
        'color': timerTextColor()
      }">
        <span *ngIf="remainingSeconds() > 0">{{ remainingSeconds() }}</span>
        <span *ngIf="remainingSeconds() === 0">0</span>
        <span *ngIf="remainingSeconds() < 0">+{{ -remainingSeconds() }}</span>
      </div> -->

      <div class="timer-icon">

    
    <svg class="progress-ring" viewBox="0 0 36 36">
      <circle
        class="ring-progress"
        cx="18"
        cy="18"
        r="16"
        [attr.stroke-dashoffset]="progressOffset()"
        [attr.stroke]="interpolatedColor()"
      />
    </svg>
  
  <span class="timer-text">
    <ng-container *ngIf="remainingSeconds() > 0">{{ displaySeconds() }}</ng-container>
    <ng-container *ngIf="remainingSeconds() === 0">0</ng-container>
    <ng-container *ngIf="remainingSeconds() < 0">+{{ -remainingSeconds() }}</ng-container>
  </span>
</div>


      <button mat-raised-button
        (click)="completeStep()"
        [ngStyle]="{ 'background-color': interpolatedColor() }"
        class="transition-button"
      >
        I took my time
      </button>
    </div>
  `,
  styles: [`
    .transition-button {
      color: white;
      transition: background-color 1s linear;
      margin-top: 10px;
    }

    .timer-icon {
      display: inline-block;
      font-size: 2rem;
      font-family: 'Courier New', Courier, monospace;
      background: #f3f3f3;
      // border: 2px solid rgba(79, 137, 13, 0.34);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      line-height: 60px;
      text-align: center;
      margin-bottom: 12px;
      box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
      transition: color 1s linear, border-color 1s linear;
      position: relative;

    }
    .timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Rubik', sans-serif; /* already good for roundness */
  font-weight: 300; /* lighter weight */
  font-size: 1.5rem;
  color: rgba(64, 59, 59, 0.7);
  letter-spacing: 0.5px; /* optional: adds airy spacing */
  pointer-events: none;
}


    .progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
    .ring-progress {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 100;
  transition: stroke-dashoffset 1s linear;
}
.ring-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 4;
}
  `]
})
export class R2SettleDownComponent {
  dailyReflectonService = inject(DailyReflectionService);

  totalSeconds = 60;
  remainingSeconds = signal(this.totalSeconds);

  constructor() {
    this.startTimer();
  }

  startTimer() {
    setInterval(() => {
      this.remainingSeconds.update(n => n - 1);
    }, 1000);
  }

  completeStep() {
    this.dailyReflectonService.$currentStep.set('reflect-on-good');
  }

  interpolatedColor = computed(() => {
    const value = this.remainingSeconds();
    const clamped = Math.max(value, 0);
    const progress = (this.totalSeconds - clamped) / this.totalSeconds;

    const r = Math.round(255 * (1 - progress)); // 255 to 0
    const g = Math.round(140 * (1 - progress) + 128 * progress); // 140 to 128
    const b = 0;

    return `rgb(${r}, ${g}, ${b})`;
  });

  timerTextColor = computed(() => {
    const base = this.interpolatedColor();
    // Inject 0.7 alpha into `rgb(r, g, b)` → `rgba(r, g, b, 0.7)`
    const [r, g, b] = base.match(/\d+/g) ?? [0, 0, 0];
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  });

  progressOffset = computed(() => {
    const remaining = Math.max(this.remainingSeconds(), 0);
    const progress = (this.totalSeconds - remaining) / this.totalSeconds;
    return `${100 - progress * 100}`;
  });
  

  displaySeconds = computed(() => {
    const sec = this.remainingSeconds();
  
    if (sec % 5 === 0 || sec >= 50) {
      return sec;
    }
    // Round to the next multiple of 5:
    return sec + (5 - sec % 5);
  });
  
  
}
