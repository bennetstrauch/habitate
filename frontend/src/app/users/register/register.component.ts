import { Component, inject, output, signal } from '@angular/core';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { validationRules } from '@global/auth/validationRules'
import { MatStepperModule } from '@angular/material/stepper';
import { UsersService } from '../users.service';
import { User } from '@backend/users/users.model'
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { Part2 } from "./part2";
import { RegisterStepOneComponent } from "./step1";



@Component({
  imports: [ReactiveFormsModule, MatStepperModule, MatFormFieldModule, MatInputModule, MatButton, Part2, RegisterStepOneComponent],

  template: `

    <mat-stepper headerPosition="top" #stepper>

      <mat-step [stepControl]="userDetailsForm">

      <app-register-step-one (userDetailsFormData)="receiveUserDetails($event)"></app-register-step-one>

      </mat-step>


      <mat-step>
        <app-register-part2/> 
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
      </mat-step>


      
      <mat-step>
        <app-register-part2/> 
          <div>
            <button mat-button matStepperPrevious>Back</button>
            <button mat-button matStepperNext>Next</button>
          </div>
      </mat-step>


      <mat-step>
        <ng-template matStepLabel>Done</ng-template>
        You are now done.
        <div>
          <button mat-button matStepperPrevious>Back</button>
          <button mat-button (click)="stepper.reset()">Reset</button>
        </div>
      </mat-step>

    </mat-stepper>

    
  `,
  styles: ``
})
export class RegisterComponent {

  #usersService = inject(UsersService)
  #router = inject(Router)

  receiveUserDetails(data: User){
    console.log('receivedUserDetails: ', data)
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

