import { Component, inject, input, Input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';
import { User } from '@backend/users/users.model';
import { validationRules } from '@global/auth/validationRules'
import { MatStep, MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';


@Component({
  selector: 'app-register-step-one',
  imports: [ MatFormFieldModule, ReactiveFormsModule, MatStep, MatStepperModule, MatInputModule, MatButton],
  template: `
  

 

    <form [formGroup]="userDetailsForm">
      <ng-template matStepLabel>Let's habitate your account</ng-template>

      <mat-form-field>

      <mat-label> </mat-label>
        <input matInput placeholder="Your desired name" formControlName="name" required>
      </mat-form-field> <br>

      <mat-form-field>
        <input matInput placeholder="Your email" formControlName="email" required>
      </mat-form-field> <br>

      <mat-form-field>
        <input matInput placeholder="Your top secret password" formControlName="password" required>
      </mat-form-field> <br>


      <button mat-button (click)="sendFormData()" matStepperNext>Continue</button>
    </form>





  `
})
export class RegisterStepOneComponent {

  userDetailsForm = input.required<FormGroup>();
  userDetailsFormData = output<User>()

  sendFormData(){
    this.userDetailsFormData.emit(this.userDetailsForm.value as User)
  }

}


//# one variable for each form property. or create type reigisterrequest and iterate over keyset
export const formProperties = ['name', 'email', 'password']

export const validators = {
  name: [ 
    Validators.required, 
    Validators.minLength(validationRules.name.minLength), 
    Validators.maxLength(validationRules.name.maxLength)
  ],

  email: [
    Validators.required, 
    Validators.email
  ],

  password: [
    Validators.required, 
    Validators.minLength(validationRules.password.minLength), 
    Validators.maxLength(validationRules.password.maxLength)
  ]

}

