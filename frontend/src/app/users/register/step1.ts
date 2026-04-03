import { Component, inject, Input, signal } from '@angular/core';
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
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-register-step-one',
  standalone: true,
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
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
  template: `
    <div class="form-container" @fadeInOut>
      <h2>Let's Create Your Account</h2>
      <form [formGroup]="userDetailsForm" class="form">
        <mat-form-field class="form-field" appearance="outline">
          <mat-label>Your desired name</mat-label>
          <input
            matInput
            placeholder="Pappa Joe"
            formControlName="name"
            required
          />
        </mat-form-field> <br>

        <mat-form-field class="form-field" appearance="outline">
          <mat-label>Your email</mat-label>
          <input
            matInput
            placeholder="lifeislife@bliss.com"
            formControlName="email"
            required
          />
        </mat-form-field> <br>

        <mat-form-field class="form-field" appearance="outline">
          <mat-label>Top secret password</mat-label>
          <input
            matInput
            placeholder="MaaamaMia123"
            formControlName="password"
            type="password"
            required
          />
        </mat-form-field>

        <!-- Validation Messages -->
        @for (validatorEntry of (validators | keyvalue); track $index) { @let
        validatorField = userDetailsForm.get(validatorEntry['key']); @let
        validatorFieldErrors = validatorField?.errors; @if
        (validatorField?.touched && validatorField?.invalid) { @if
        (validatorFieldErrors!['required']) {
        <mat-error
          >{{ validatorEntry['key'] | titlecase }} is required.</mat-error
        >
        } @if (validatorFieldErrors!['minlength']) {
        <mat-error>
          {{ validatorEntry['key'] | titlecase }} must be at least
          {{
            validatorFieldErrors!['minlength']!['requiredLength']
          }}
          characters.
        </mat-error>
        } @if (validatorFieldErrors!['maxlength']) {
        <mat-error>
          {{ validatorEntry['key'] | titlecase }} can be at most
          {{
            validatorFieldErrors!['maxlength']!['requiredLength']
          }}
          characters.
        </mat-error>
        } @if(validatorFieldErrors!['email']){
        <mat-error>
          {{ validatorEntry['key'] }} has to be in email format:
          max...n&#64;example.com
        </mat-error>
        } } } @if ($emailExistsError()) {
        <mat-error>This email is already in use.</mat-error>
        }

        <div class="button-container">
          <button
            mat-raised-button
            color="primary"
            type="button"
            [disabled]="!userDetailsForm.valid || $checking()"
            (click)="checkEmailAndContinue()"
          >
            {{ $checking() ? 'Checking…' : 'Continue' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      

      mat-error {
        font-size: 12px;
        margin-top: 4px;
      }
    `,
  ],
})
export class RegisterStepOneComponent {
  @Input() userDetailsForm!: FormGroup;
  @Input() stepper!: MatStepper;

  $emailExistsError = signal(false);
  $checking = signal(false);
  usersService = inject(UsersService);

  ngOnInit() {
    // Reset emailAlreadyExistsError when user types in email field
    this.userDetailsForm.get('email')?.valueChanges.subscribe(() => {
      this.$emailExistsError.set(false);
    });
  }

  checkEmailAndContinue = () => {
    const email = this.userDetailsForm.get('email')?.value;
    this.$checking.set(true);
    this.usersService.checkEmail(email).subscribe((response) => {
      this.$checking.set(false);
      if (response.data) {
        this.$emailExistsError.set(true);
      } else {
        this.$emailExistsError.set(false);
        this.stepper.next();
      }
    });
  };

  validators = validators;
}
