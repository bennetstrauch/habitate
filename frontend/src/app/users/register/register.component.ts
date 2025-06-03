import {
  Component,
  inject,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormBuilder,
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

import { PushSubscription as WebPushSubscription } from 'web-push';
import { ReflectionReminderComponent } from '../../reflections/reflection-reminder/reflection-reminder.component';
import { ReflectionReminderService } from '../../reflections/reflection-reminder/reflection-reminder.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
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
    Step6,
    ReflectionReminderComponent,
  ],
  template: `
    <div class="card">
      <mat-stepper
        headerPosition="top"
        linear
        (selectionChange)="onStepChange($event)"
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

    .card {
      padding: 16px;
      margin: 16px auto;
      max-width: 600px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `,
})
export class RegisterComponent {
  #stateService = inject(StateService);
  #usersService = inject(UsersService);
  #router = inject(Router);
  #reflectionReminderService = inject(ReflectionReminderService);
  #snackBar = inject(MatSnackBar);

  firstEmailReceived = false;

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

  onStepChange(event: StepperSelectionEvent) {
    // add valdidators to the reflectionTrigger field:
    if (event.selectedIndex === 3) {
      this.userDetailsForm.controls.reflectionTrigger.addValidators(
        Validators.required
      );
      this.userDetailsForm.controls.reflectionTrigger.updateValueAndValidity();
    }

    else // Send test email when moving from step 4-2 (index 4) to next step
    if (event.previouslySelectedIndex === 4 && event.selectedIndex === 5 && !this.firstEmailReceived) {
      const enableEmail = this.userDetailsForm.get('enableEmail')?.value || false;
      if (enableEmail) {
        const email = this.userDetailsForm.get('email')?.value || '';
        const name = this.userDetailsForm.get('name')?.value || 'Friend';
        this.#usersService.sendTestEmail(email, name).subscribe({
          next: () => {
            this.#snackBar.open(
              'We have sent you a test email just to test. Please check if you received one, or if it landed in the SpamFolder. If so, please unspam it.',
              'Close',
              { duration: 15000 }
            );
            this.firstEmailReceived = true;
          },
          error: () => {
            this.#snackBar.open('Failed to send test email', 'Close', { duration: 5000 });
          },
        });
      }
    }
  }

  async register() {
    if (this.userDetailsForm.valid) {
      const enablePush = this.userDetailsForm.get('enablePush')?.value || false;
      const pushSubscriptions = await this.#reflectionReminderService.handlePushSubscription(enablePush, []);
      const reflectionReminderTime = this.#reflectionReminderService.getReflectionReminderTime(this.userDetailsForm);

      const userDetails: User = {
        name: this.userDetailsForm.get('name')?.value || '',
        email: this.userDetailsForm.get('email')?.value || '',
        password: this.userDetailsForm.get('password')?.value || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        reflectionTrigger: this.userDetailsForm.get('reflectionTrigger')?.value || '',
        reflectionDetails: {
          enablePush: pushSubscriptions.length > 0,
          enableEmail: this.userDetailsForm.get('enableEmail')?.value || false,
          reflectionReminderTime,
          pushSubscriptions,
          firstEmailReceived: this.firstEmailReceived,
        },
        tourCompleted: false,
      };

      this.#usersService.register(userDetails).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Account created successfully. Welcome on board!');
            this.#router.navigate(['', 'login']);
          } else {
            alert('Sorry, something went wrong. Please try again or try later.');
          }
        },
        error: () => {
          alert('Registration failed. Please try again.');
        },
      });
    }
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