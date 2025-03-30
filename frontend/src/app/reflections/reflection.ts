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
import { StateService } from '../state.service';
import { Goal, Habit } from '@backend/goals/goals.types';
import { R1WelcomeComponent } from './display/r1-welcome.component';
import { R2SettleDownComponent } from './display/r2-settle-down.component';
import { R3ReflectOnGoodComponent } from './display/r3-reflect-on-good.component';
import { NgComponentOutlet, NgIf } from '@angular/common';
import { DailyReflectionService } from './daily-reflection.service';
import { RGoalComponent } from './display/r-goal.component';

@Component({
  selector: 'app-reflection',
  imports: [
    MatStepperModule,
    MatButtonModule,
    MatCheckboxModule,
    NgComponentOutlet,
    NgIf,
  ],
  template: `

    <ng-container *ngIf="$currentComponent() as component">
      <ng-container *ngComponentOutlet="component"></ng-container>
    </ng-container>
  `,
  styles: `
    
    ::ng-deep .mat-horizontal-stepper-header-container {
        display: none !important;
        // removes icons from stepper
    }
`,
})
export class ReflectionComponent {
  readonly #router = inject(Router);
  readonly goalsService = inject(GoalsService);
  readonly reflectionsService = inject(ReflectionsService);
  readonly dailyReflectionService = inject(DailyReflectionService);
  readonly progressService = inject(ProgressService);
  readonly stateService = inject(StateService);

  $currentComponent = computed(() => { 

    console.log("currentStep: ", this.dailyReflectionService.$currentStep())
    return this.dailyReflectionService .stepComponentMap.get(this.dailyReflectionService.$currentStep())
  }
  );

  constructor(private route: ActivatedRoute) {}

 

  
}
