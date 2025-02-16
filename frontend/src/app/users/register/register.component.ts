import {
  Component,
  effect,
  inject,
  Input,
  output,
  signal,
} from '@angular/core';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
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
import { MatButton, MatButtonModule } from '@angular/material/button';
import { Step2 } from './step2';
import { RegisterStepOneComponent } from './step1';
import { Step3 } from './step3';
import { Step4 } from './step4';
import { Step5 } from './step5';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { StateService } from '../../state.service';

// # make it generic and loop through steps when building

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
    Step5,
  ],

  template: `
    <mat-stepper
      class="card"
      headerPosition="top"
      linear
      (selectionChange)="addNeededValidatorsOnStepChange($event)"
      #stepper
    >
      <mat-step [stepControl]="userDetailsForm">
        <app-register-step-one [userDetailsForm]="userDetailsForm" />
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
        <app-register-step5
          [reflectionTrigger]="userDetailsForm.controls.reflectionTrigger.value"
        />

        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button (click)="register()">Submit Registration</button>
        </div>
      </mat-step>
    </mat-stepper>
  `,
  styles: ``,
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
    const userDetails = this.userDetailsForm.value as User;
    userDetails.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    this.#usersService
      .register(this.userDetailsForm.value as User)
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
