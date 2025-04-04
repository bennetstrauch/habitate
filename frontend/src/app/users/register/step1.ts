import { Component, inject, input, Input, output, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';
import { User } from '@backend/users/users.types';
import { validationRulesRegister } from '@global/auth/validationRules';
import {
  MatStep,
  MatStepper,
  MatStepperModule,
} from '@angular/material/stepper';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { CommonModule, JsonPipe, KeyValuePipe } from '@angular/common';
import { validators } from './register.component';

@Component({
  selector: 'app-register-step-one',
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatError,
    MatStepperModule,
    MatInput,
    MatButton,
    KeyValuePipe,
  ],
  template: `
    <form [formGroup]="userDetailsForm">
      <ng-template matStepLabel>Let's habitate your account</ng-template>

      <mat-form-field>
        <mat-label> Your desired name: </mat-label>
        <input
          matInput
          placeholder="Pappa Joe"
          formControlName="name"
          required
        />

        <!-- @if (userDetailsForm.get('name')?.hasError('required')) {
          <mat-error>Required</mat-error>
        } @else if (userDetailsForm.get('name')?.hasError('minlength')) {
          <mat-error>Minimum {{validationRules.name.minLength}}</mat-error>
        } @else if (userDetailsForm.get('name')?.hasError('maxlength')) {
          <mat-error>Maximum {{validationRules.name.maxLength}}</mat-error>
        }  -->
      </mat-form-field>
      <br />

      <mat-form-field>
        <mat-label> Your email: </mat-label>

        <input
          matInput
          placeholder="lifeislife@bliss.com"
          formControlName="email"
          required
        />
      </mat-form-field>
      <br />

      <mat-form-field>
        <mat-label> Top secret password: </mat-label>

        <input
          matInput
          placeholder="MaaamaMia123"
          formControlName="password"
          type="password"
          required
        />
      </mat-form-field>
      <br />

      <button
        mat-button
        type="button"
        [disabled]="!userDetailsForm.valid"
        (click)="checkEmailAndContinue()"
      >
        Continue
      </button>

      <!-- VALIDATION -->
      @for(validatorEntry of (validators | keyvalue) ; track $index){ @let
      validatorField = userDetailsForm.get(validatorEntry['key']); @let
      validatorFieldErrors = validatorField?.errors; @if(validatorField?.touched
      && validatorField?.invalid){ @if(validatorFieldErrors!['required']){
      <mat-error> {{ validatorEntry['key'] }} is required. </mat-error>
      } @if(validatorFieldErrors!['minlength']){
      <mat-error>
        {{ validatorEntry['key'] }} has to be at least
        {{ validatorFieldErrors!['minlength']!['requiredLength'] }} characters.
      </mat-error>
      } @if(validatorFieldErrors!['maxlength']){
      <mat-error>
        {{ validatorEntry['key'] }} can be at most
        {{ validatorFieldErrors!['maxlength']!['requiredLength'] }} characters.
      </mat-error>
      } @if(validatorFieldErrors!['email']){
      <mat-error>
        {{ validatorEntry['key'] }} has to be in email format:
        max...n&#64;example.com
      </mat-error>
      } } } @if($emailExistsError()){
      <mat-error> This email is already in use. </mat-error>
      <!-- {{userDetailsForm.get(validatorEntry['key'])?.errors! | json}} -->
      }
    </form>
  `,
})
export class RegisterStepOneComponent {
  @Input() userDetailsForm!: FormGroup;
  @Input() stepper!: MatStepper;

  $emailExistsError = signal(false);
  usersService = inject(UsersService);

  ngOnInit() {
    // Reset emailAlreadyExistsError when user types in email field
    this.userDetailsForm.get('email')?.valueChanges.subscribe(() => {
      this.$emailExistsError.set(false);
    });
  }

  checkEmailAndContinue = () => {
    console.log('formvalid: ', this.userDetailsForm.valid);

    const email = this.userDetailsForm.get('email')?.value;

    this.usersService.checkEmail(email).subscribe((response) => {
      if (response.data) {
        this.$emailExistsError.set(true); // Show error message
        console.log('Email already exists. Please choose another one.');
      } else {
        this.$emailExistsError.set(false);
        console.log('Proceeding to next step...');
        this.stepper.next();
        // Here, you can trigger navigation to the next step
      }
    });
  };

  validators = validators;
}
