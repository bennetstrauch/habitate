import { Component, inject, input, Input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';
import { User } from '@backend/users/users.model';
import { validationRules } from '@global/auth/validationRules'
import { MatStep, MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { CommonModule, JsonPipe, KeyValuePipe } from '@angular/common';
import { validators,  } from './register.component';


@Component({
  selector: 'app-register-step-one',
  imports: [MatFormFieldModule, ReactiveFormsModule, CommonModule, MatError, MatStepperModule, MatInput, MatButton, KeyValuePipe, JsonPipe],
  template: `
  

 

    <form [formGroup]="userDetailsForm">
      <ng-template matStepLabel>Let's habitate your account</ng-template>

      <mat-form-field>
        <mat-label> Your desired name: </mat-label>
        <input matInput placeholder="Pappa Joe" formControlName="name" required />
        

        <!-- @if (userDetailsForm.get('name')?.hasError('required')) {
          <mat-error>Required</mat-error>
        } @else if (userDetailsForm.get('name')?.hasError('minlength')) {
          <mat-error>Minimum {{validationRules.name.minLength}}</mat-error>
        } @else if (userDetailsForm.get('name')?.hasError('maxlength')) {
          <mat-error>Maximum {{validationRules.name.maxLength}}</mat-error>
        }  -->

      </mat-form-field> <br>


      <mat-form-field>
        <mat-label> Your email: </mat-label>

        <input matInput placeholder="lifeislife@bliss.com" formControlName="email" required />
      </mat-form-field> <br>

      <mat-form-field>
        <mat-label> Top secret password: </mat-label>

        <input matInput placeholder="MaaamaMia123" formControlName="password" required>
      </mat-form-field> <br>

      <button mat-button matStepperNext type="button" (click)='continue()'>Continue</button>


      <!-- VALIDATION -->
      @for(validatorEntry of (validators | keyvalue) ; track $index){
        
        @let validatorField = userDetailsForm.get(validatorEntry['key']);
        @let validatorFieldErrors = validatorField?.errors;

          @if(validatorField?.touched && validatorField?.invalid){
            
            @if(validatorFieldErrors!['required']){
              <mat-error> {{validatorEntry['key']}} is required. </mat-error>
            }

            @if(validatorFieldErrors!['minlength']){
              <mat-error> {{validatorEntry['key']}} has to be at least {{validatorFieldErrors!['minlength']!['requiredLength']}} characters. </mat-error>
            }

            @if(validatorFieldErrors!['maxlength']){
              <mat-error> {{validatorEntry['key']}} can be at most {{validatorFieldErrors!['maxlength']!['requiredLength']}} characters. </mat-error>
            }

            @if(validatorFieldErrors!['email']){
              <mat-error> {{validatorEntry['key']}} has to be in email format: max...n&#64;example.com </mat-error>
            }

          <!-- {{userDetailsForm.get(validatorEntry['key'])?.errors! | json}} -->
       }
     }

    </form>





  `
})
export class RegisterStepOneComponent {

  @Input() userDetailsForm!: FormGroup;

  continue = () => console.log('formvalid: ', this.userDetailsForm.valid)

  validators = validators



}

