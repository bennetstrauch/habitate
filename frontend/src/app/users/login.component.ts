import { Component, inject } from '@angular/core';
import { ErrorWithStatus } from '@backend/utils/error.class';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { validators } from './register/register.component';
import { UsersService } from './users.service';
import { LoginRequest } from '@backend/types/login/loginRequest';
import { StateService } from '../state.service';
import { jwtDecode } from 'jwt-decode';
import { Token } from '@backend/types/token';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="card login-container">
      <h2 class="login-title">Welcome Back</h2>
      <form [formGroup]="form" (ngSubmit)="login()" class="login-form">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput placeholder="Enter your email" formControlName="email" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input
            matInput
            type="password"
            placeholder="Enter your password"
            formControlName="password"
          />
        </mat-form-field>

        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="form.invalid"
          class="login-button"
        >
          Login
        </button>
      </form>

      <a
        (click)="handlePasswordReset()"
        class="forgot-password"
      >
        Forgot Password?
      </a>
    </div>
  `,
  styles: [
    `
      .login-container {
        margin-top: 00px;
        
      }

      .login-title {
        font-size: 24px;
        font-weight: 500;
        color: #333;
        margin-bottom: 35px;
        text-align: center;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 400px;
        gap: 15px;
      }

      mat-form-field {
        width: 100%;
      }

      .login-button {
        padding: 10px;
        font-size: 16px;
        text-transform: uppercase;
        margin-top: 10px;
      }

      .forgot-password {
        font-size: 14px;
        color: #1976d2;
        text-decoration: none;
        cursor: pointer;
        margin-top: 15px;
        transition: color 0.3s ease;
      }

      .forgot-password:hover {
        color: #0d47a1;
        text-decoration: underline;
      }

      @media (max-width: 600px) {
        .login-form {
          max-width: 100%;
        }
      }
    `,
  ],
})
export class LoginComponent {
  #usersService = inject(UsersService);
  #stateService = inject(StateService);
  #router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    email: ['', validators.email],
    password: ['', validators.password],
  });

  login() {
    this.#usersService
      .login(this.form.value as LoginRequest)
      .pipe(
        catchError((err: ErrorWithStatus) => {
          if (err.status == 401) {
            alert(err?.error);
            console.log('catched error: ', err);
          } else {
            alert('An unknown error occurred');
          }
          return of(null);
        })
      )
      .subscribe((response) => {
        if (!response) return;
        console.log('login user:', response);

        const token = response.data.token;
        const payloadDecoded = jwtDecode(token) as Token;
        console.log(payloadDecoded);

        this.#stateService.$state.set({
          _id: payloadDecoded._id,
          name: payloadDecoded.name,
          email: payloadDecoded.email,
          jwtToken: token,
        });

        const pathSegments = ['', 'goals', 'overview'];
        const fullPath = this.#router.serializeUrl(
          this.#router.createUrlTree(pathSegments)
        );
        window.location.href = fullPath;
      });
  }

  handlePasswordReset() {
    sessionStorage.setItem(
      'resetEmail',
      this.form.value.email || 'youremail.com'
    );
    this.#router.navigate(['', 'reset-password']);
  }
}