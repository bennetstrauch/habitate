import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { validators } from '../register/register.component';
import { ActivatedRoute } from '@angular/router';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-set-new-password',
  imports: [MatFormFieldModule, ReactiveFormsModule, MatInput],
  template: `
    <form [formGroup]="userDetailsForm" class="card">
      <mat-form-field>
        <mat-label> New password: </mat-label>

        <input
          matInput
          placeholder="MaaamaMia123"
          formControlName="password"
          type="password"
          required
        />
      </mat-form-field>
<br>
      <mat-form-field>
      <mat-label> Please Confirm: </mat-label>

        <input
          matInput
          type="password"
          placeholder="Confirm password"
          formControlName="confirmPassword"
          required
        />
      </mat-form-field>
    </form>
    @let password = userDetailsForm.get('password');
    @if(password!.hasError('required')){
    <mat-error>
      You want an empty password? That would be easy to remember :D Yet, please
      give me at least 5 letters.
    </mat-error>

    }
  `,
  styles: ``,
})
export class SetNewPasswordComponent {
  private route = inject(ActivatedRoute);
  private token = '';


  constructor() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }


  userDetailsForm = inject(FormBuilder).nonNullable.group({
    password: ['', validators.password],
    confirmPassword: ['', [Validators.required]],
  });
}
