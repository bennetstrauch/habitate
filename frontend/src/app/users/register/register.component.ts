import {
  Component,
  effect,
  inject,
  Input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { validationRulesRegister } from '@global/auth/validationRules';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { UsersService } from '../users.service';
import { User } from '@backend/users/users.types';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Step2 } from './step2';
import { RegisterStepOneComponent } from './step1';
import { Step3 } from './step3';
import { Step4 } from './step4';
import { Step4_2 } from './step4-2';
import { Step5 } from './step5';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { StateService } from '../../state.service';
import { Step6 } from './step6';
import { dayColorMap } from '../../main/app.component';

@Component({
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    Step2,
    RegisterStepOneComponent,
    Step3,
    Step4,
    Step4_2,
    Step5,
    Step6
  ],
  template: `
    <div class="card">
      <mat-stepper
        headerPosition="top"
        linear
        (selectionChange)="addNeededValidatorsOnStepChange($event)"
        #stepper
      >
        <mat-step [stepControl]="userDetailsForm">
          <app-register-step-one [userDetailsForm]="userDetailsForm" [stepper]="stepper" />
        </mat-step>

        <mat-step>
          <app-register-step2 />
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </mat-step>

        <mat-step>
          <app-register-step3 />
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </mat-step>

        <mat-step>
          <app-register-step4 [userDetailsForm]="userDetailsForm" />
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </mat-step>

        <mat-step>
          <app-register-step4-2 [userDetailsForm]="userDetailsForm" />
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </mat-step>

        <mat-step>
          <app-register-step5
            [reflectionTrigger]="userDetailsForm.controls.reflectionTrigger.value"
          />
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
        </mat-step>

        <mat-step>
          <app-register-step6 />
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button (click)="register()">Submit Registration</button>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: `
    ::ng-deep .mat-horizontal-stepper-header-container {
      display: none !important;
    }

    mat-stepper {
      background: #ffffff !important;
    }
  `,
})
export class RegisterComponent {
  #stateService = inject(StateService);
  #usersService = inject(UsersService);
  #router = inject(Router);

  userDetailsForm = inject(FormBuilder).nonNullable.group({
    name: ['', validators.name],
    email: ['', validators.email],
    password: ['', validators.password],
    reflectionTrigger: [''],
    enablePush: [false],
    enableEmail: [false],
    hour: ['08'],
    minute: ['15'],
    period: ['PM'],
  });

  addNeededValidatorsOnStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 3) {
      this.userDetailsForm.controls.reflectionTrigger.addValidators(
        Validators.required
      );
      this.userDetailsForm.controls.reflectionTrigger.updateValueAndValidity();
    }
  }

  register() {
    let reflectionReminderTime: string | undefined;
    const enablePush = this.userDetailsForm.get('enablePush')?.value || false;
    const enableEmail = this.userDetailsForm.get('enableEmail')?.value || false;
    if (enablePush || enableEmail) {
      const hour = parseInt(this.userDetailsForm.get('hour')?.value || '08');
      const minute = this.userDetailsForm.get('minute')?.value;
      const period = this.userDetailsForm.get('period')?.value;
      const adjustedHour = period === 'PM' && hour < 12 ? hour + 12 : period === 'AM' && hour === 12 ? 0 : hour;
      reflectionReminderTime = `${adjustedHour.toString().padStart(2, '0')}:${minute}`;
    }

    const userDetails = {
      ...this.userDetailsForm.value,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      reflectionDetails: {
        enablePush,
        enableEmail,
        reflectionReminderTime,
      },
    };

    this.#usersService
      .register(userDetails as User)
      .subscribe((response) => {
        console.log(response);

        if (response.success) {
          alert('Account created successfully. Welcome on board!');
        } else {
          alert('Sorry, something went wrong. Please try again or try later.');
        }

        this.#router.navigate(['', 'login']);
      });
  }
}

export const validators = {
  name: [
    Validators.required,
    Validators.minLength(validationRulesRegister.name.minLength),
    Validators.maxLength(validationRulesRegister.name.maxLength),
  ],

  email: [Validators.required, Validators.email],

  password: [
    Validators.required,
    Validators.minLength(validationRulesRegister.password.minLength),
    Validators.maxLength(validationRulesRegister.password.maxLength),
  ],
};