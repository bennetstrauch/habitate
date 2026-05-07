import {
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { GoalsService } from '../goals/goals.service';
import { ProgressService } from '../progresses/progresses.service';
import { ActivatedRoute } from '@angular/router';
import { ReflectionsService } from './reflections.service';
import { StateService } from '../state.service';
import { NgComponentOutlet } from '@angular/common';
import { DailyReflectionService } from './daily-reflection.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-reflection',
  imports: [
    MatStepperModule,
    MatButtonModule,
    MatCheckboxModule,
    NgComponentOutlet,
  ],
  animations: [
    trigger('stepFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('320ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ position: 'absolute', top: '0', left: '0', width: '100%', opacity: 1 }),
        animate('280ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    @if ($persistedScene()) {
      <div class="scene-bg" [innerHTML]="$persistedScene()"></div>
    }
    @for (step of [$currentStep()]; track step) {
      <div @stepFade class="step-host">
        <ng-container *ngComponentOutlet="$currentComponent()"></ng-container>
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .step-host {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .scene-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
      animation: scene-dim-in 600ms ease forwards;
    }

    .scene-bg ::ng-deep * {
      animation-play-state: paused !important;
    }

    @keyframes scene-dim-in {
      from { opacity: 0; }
      to   { opacity: 0.35; }
    }

    ::ng-deep .mat-horizontal-stepper-header-container {
      display: none !important;
    }
  `,
})
export class ReflectionComponent {
  readonly #router = inject(Router);
  readonly #sanitizer = inject(DomSanitizer);
  readonly goalsService = inject(GoalsService);
  readonly reflectionsService = inject(ReflectionsService);
  readonly dailyReflectionService = inject(DailyReflectionService);
  readonly progressService = inject(ProgressService);
  readonly stateService = inject(StateService);

  $currentStep = this.dailyReflectionService.$currentStep;

  $currentComponent = computed(() => {
    return this.dailyReflectionService.stepComponentMap.get(
      this.dailyReflectionService.$currentStep()
    ) ?? null;
  });

  $persistedScene = computed<SafeHtml | null>(() => {
    const html = this.dailyReflectionService.$backgroundSceneHtml();
    if (!html || !this.dailyReflectionService.$backgroundActive()) return null;
    if (this.$currentStep() === 'settle-down') return null;
    return this.#sanitizer.bypassSecurityTrustHtml(html);
  });

  constructor(private route: ActivatedRoute) {}
}
