import { Component, inject, Input, output, signal } from '@angular/core';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { validationRules } from '@global/auth/validationRules'
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { UsersService } from '../users.service';
import { User } from '@backend/users/users.model'
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { Step2 } from "./step2";
import { RegisterStepOneComponent } from "./step1";
import { Step3 } from "./step3";
import { Step4 } from "./step4";

// # make it generic and loop through steps when building 

@Component({
  imports: [ReactiveFormsModule, MatStepperModule, MatFormFieldModule, MatInputModule, MatButton, Step2, RegisterStepOneComponent, Step3, Step4],

  template: `

    <mat-stepper headerPosition="top" #stepper>


      <mat-step [stepControl]="userDetailsForm">
        <app-register-step-one
        [stepper]="stepper"
        [userDetailsForm]="userDetailsForm"
        (userDetailsFormData)="receiveUserDetails($event)"
        />
      </mat-step>


      
      <mat-step>
        <app-register-step2/> 
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
      </mat-step>


      <mat-step>
        <app-register-step3/> 
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
      </mat-step>


      <mat-step>
        <app-register-step4/> 
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
      </mat-step>


      


      <!-- <mat-step>
        <ng-template matStepLabel>Done</ng-template>
        You are now done.
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button (click)="stepper.reset()">Reset</button>
        </div>
      </mat-step> -->

    </mat-stepper>

    
  `,
  styles: ``
})
export class RegisterComponent {

  userDetailsForm = inject(FormBuilder).nonNullable.group({
    'name': ['', validators.name],
    'email': ['', validators.email],
    'password': ['', validators.password]
  })

  #usersService = inject(UsersService)
  #router = inject(Router)

  newUser : User = {
    name: '',
    email: '',
    password: '',

    reflectionTrigger: ''
  }

  receiveUserDetails(data: User){
    console.log('receivedUserDetails: ', data)
    this.newUser = data
  }





  
  // register(){

  //   this.#usersService.register(this.$newUser).subscribe(response => {
  //     console.log(response)
  //     this.#router.navigate(['', 'login'])
  //   })
  // }

}




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

