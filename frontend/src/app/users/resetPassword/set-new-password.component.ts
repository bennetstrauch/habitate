import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { validators } from '../register/register.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatInput } from '@angular/material/input';
import { validationRulesRegister } from '@global/auth/validationRules';
import { MatButton } from '@angular/material/button';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-set-new-password',
  imports: [MatFormFieldModule, ReactiveFormsModule, MatInput, MatButton],
  template: `
    <div class="card">
      <h4>Set new password</h4>
      <br />

      <form [formGroup]="userDetailsForm">
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
        <br />
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
        <br />
        <button mat-raised-button (click)="onSubmit()">Save</button>
      </form>
    </div>
    @let password = userDetailsForm.get('password'); @if(password!.touched &&
    password!.hasError('required')){
    <mat-error>
      You want an empty password? <br />That would be easy to remember :D
      <br />Yet, please give me at least {{ minLengthPassword }} letters.
    </mat-error>
    } @else if(password!.touched && password!.hasError('minlength')){
    <mat-error> Minimum {{ minLengthPassword }} characters. </mat-error>
    } @else if(password!.hasError('maxlength')){
    <mat-error> Maximum {{ minLengthPassword }} characters. </mat-error>
    } 
  `,
  styles: ``,
})
export class SetNewPasswordComponent {
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private token = '';
  readonly usersService = inject(UsersService);

  minLengthPassword = validationRulesRegister.password.minLength;
  maxLengthPassword = validationRulesRegister.password.maxLength;
  error = signal('');

  // #remove error message when user starts typing

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';
    });
  }

  userDetailsForm = inject(FormBuilder).nonNullable.group({
    password: ['', validators.password],
    confirmPassword: ['', [Validators.required]],
  });

  onSubmit() {
    const newPassword = this.userDetailsForm.value.password;

    if (newPassword !== this.userDetailsForm.value.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.usersService
      .setNewPassword({
        token: this.token,
        newPassword: this.userDetailsForm.value.password!,
      })
      .subscribe({
        next: () => {
          alert('Password changed successfully!');
          this.router.navigate(['', 'login']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Something went wrong');
        },
      });
  }
}
