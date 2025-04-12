import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { validators } from '../register/register.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-reset-password-request',
  imports: [MatFormFieldModule, ReactiveFormsModule, MatInput, MatButton],
  template: `
    <div class="card header">
      <h5>Reset Password</h5>
    </div>

    <div class="card">
      <form [formGroup]="resetPasswordForm">
        <mat-hint
          >My dear friend, <br />
          may your memory be restored quickly. <br />
          <br />
          In the meantime, you can enter your email address <br />
          and we will send you a Reset-Link :)
        </mat-hint>
        <br />
        <br />
        <mat-form-field>
          <input
            matInput
            [formControl]="resetPasswordForm.controls.email"
            required
          />
        </mat-form-field>
        <br />

        <button
          [disabled]="resetPasswordForm.invalid"
          (click)="requestResetLink()"
          mat-raised-button
        >
          Send Reset-Link
        </button>
      </form>

      @if ($message()) {
      <br />
      {{ $message() }}
      }
    </div>
  `,
  styles: `
  .header {
    padding-top: 1px;
    padding-bottom: 1px;
  }
  `,
})
export class ResetPasswordRequestComponent {
  usersService = inject(UsersService);
  email = sessionStorage.getItem('resetEmail');
  $message = signal('');

  resetPasswordForm = inject(FormBuilder).group({
    email: [this.email, validators.email],
  });

  ngOnInit() {
    // Reset emailAlreadyExistsError when user types in email field
    this.resetPasswordForm.get('email')?.valueChanges.subscribe(() => {
      this.$message.set('');
    });
  }

  requestResetLink() {
    const email = this.resetPasswordForm.value.email;
    // Implement the logic to send the reset link to the user's email
    // You can use a service to handle the API call
    console.log('Sending reset link to:', this.resetPasswordForm.value.email);

    if (email) {
      this.usersService.sendResetLinkRequest(email).subscribe({
        next: (response) => {
          this.$message.set(response.data);
        },
        error: (error) => {
          this.$message.set(
            'No user with this email found. I hope you will remember the correct one soon! :)'
          );
        },
      });
    }
  }
}
