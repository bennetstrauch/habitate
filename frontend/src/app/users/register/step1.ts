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
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register-step-one',
  imports: [ MatFormFieldModule, ReactiveFormsModule, CommonModule, MatError, MatStepperModule, MatInput, MatButton],
  template: `
  

 

    <form [formGroup]="userDetailsForm">
      <ng-template matStepLabel>Let's habitate your account</ng-template>

      <mat-form-field>
        <mat-label> Your desired name: </mat-label>
        <input matInput placeholder="Pappa Joe" formControlName="name" required>
        <!-- <mat-error *ngIf="userDetailsForm.get('name')?.invalid">Name is required</mat-error> -->
      </mat-form-field> <br>

      <mat-form-field>
        <mat-label> Your email: </mat-label>

        <input matInput placeholder="lifeislife@bliss.com" formControlName="email" required>
      </mat-form-field> <br>

      <mat-form-field>
        <mat-label> Top secret password: </mat-label>

        <input matInput placeholder="MaaamaMia123" formControlName="password" required>
      </mat-form-field> <br>


      <button mat-button matStepperNext type="button" (click)='continue()'>Continue</button>
    </form>





  `
})
export class RegisterStepOneComponent {

  @Input() userDetailsForm!: FormGroup;

  continue = () => console.log('formvalid: ' , this.userDetailsForm.valid)

}

