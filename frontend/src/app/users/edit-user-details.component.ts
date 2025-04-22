import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatError } from '@angular/material/form-field';
import { User } from '@backend/users/users.types';
import { CommonModule } from '@angular/common';
import { validationRulesRegister } from '@global/auth/validationRules';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from './users.service';

@Component({
  selector: 'app-edit-user-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatError
  ],
  template: `
    <form [formGroup]="editUserForm" (ngSubmit)="saveChanges()">
      <h2>Edit Your Details</h2>

      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" required />
        @if (editUserForm.get('name')?.hasError('required')) {
          <mat-error>Required</mat-error>
        } @else if (editUserForm.get('name')?.hasError('minlength')) {
          <mat-error>Minimum {{validationRules.name.minLength}} characters</mat-error>
        } @else if (editUserForm.get('name')?.hasError('maxlength')) {
          <mat-error>Maximum {{validationRules.name.maxLength}} characters</mat-error>
        }
      </mat-form-field>
      <br />

      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" required />
        @if (editUserForm.get('email')?.hasError('required')) {
          <mat-error>Required</mat-error>
        } @else if (editUserForm.get('email')?.hasError('email')) {
          <mat-error>Invalid email format</mat-error>
        }
      </mat-form-field>
      <br />

      <mat-form-field>
        <mat-label>Password</mat-label>
        <input matInput type="password" formControlName="password" />
        @if (editUserForm.get('password')?.hasError('minlength')) {
          <mat-error>Minimum {{validationRules.password.minLength}} characters</mat-error>
        }
      </mat-form-field>
      <br />

      <mat-form-field>
        <mat-label>Reflection Trigger</mat-label>
        <input matInput formControlName="reflectionTrigger" />
      </mat-form-field>
      <br />

      <mat-checkbox formControlName="enablePush">
        Enable Reflection Reminder via Notification
      </mat-checkbox>
      <br />

      <mat-checkbox formControlName="enableEmail">
        Enable Reflection Reminder via Email
      </mat-checkbox>
      <br />

      <mat-form-field>
        <mat-label>Reflection Reminder Time</mat-label>
        <input matInput type="time" formControlName="reflectionReminderTime" [disabled]="!isReminderEnabled()" />
      </mat-form-field>
      <br />

      <button mat-raised-button color="primary" type="submit" [disabled]="!editUserForm.valid || !editUserForm.dirty">
        Save Changes
      </button>
    </form>
  `
})
export class EditUserDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);

  editUserForm: FormGroup;
  validationRules = validationRulesRegister;

  constructor() {
    this.editUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(validationRulesRegister.name.minLength), Validators.maxLength(validationRulesRegister.name.maxLength)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(validationRulesRegister.password.minLength)]],
      reflectionTrigger: [''],
      enablePush: [false],
      enableEmail: [false],
      reflectionReminderTime: ['']
    });
  }

  ngOnInit() {
    // Fetch current user details
    this.usersService.getUserDetails().subscribe({
      next: (response) => {
        const user = response.data;
        this.editUserForm.patchValue({
          name: user.name,
          email: user.email,
          reflectionTrigger: user.reflectionTrigger,
          enablePush: user.reflectionDetails.enablePush,
          enableEmail: user.reflectionDetails.enableEmail,
          reflectionReminderTime: user.reflectionDetails.reflectionReminderTime
        });
      },
      error: () => {
        this.snackBar.open('Failed to load user details', 'Close', { duration: 3000 });
      }
    });

    // Update reflectionReminderTime control based on notification checkboxes
    this.editUserForm.get('enablePush')?.valueChanges.subscribe(() => this.updateReminderTimeControl());
    this.editUserForm.get('enableEmail')?.valueChanges.subscribe(() => this.updateReminderTimeControl());
  }

  isReminderEnabled(): boolean {
    return this.editUserForm.get('enablePush')?.value || this.editUserForm.get('enableEmail')?.value;
  }

  updateReminderTimeControl() {
    const reminderTimeControl = this.editUserForm.get('reflectionReminderTime');
    if (this.isReminderEnabled()) {
      reminderTimeControl?.enable();
    } else {
      reminderTimeControl?.disable();
      reminderTimeControl?.setValue('');
    }
  }

  saveChanges() {
    if (this.editUserForm.valid) {
      const updatedUser: Partial<User> = {
        name: this.editUserForm.get('name')?.value,
        email: this.editUserForm.get('email')?.value,
        password: this.editUserForm.get('password')?.value || undefined,
        reflectionTrigger: this.editUserForm.get('reflectionTrigger')?.value,
        reflectionDetails: {
          enablePush: this.editUserForm.get('enablePush')?.value,
          enableEmail: this.editUserForm.get('enableEmail')?.value,
          reflectionReminderTime: this.isReminderEnabled() ? this.editUserForm.get('reflectionReminderTime')?.value : undefined
        }
      };

      this.usersService.updateUser(updatedUser).pipe(
        tap(() => {
          this.snackBar.open('User details updated successfully', 'Close', { duration: 3000 });
          this.editUserForm.markAsPristine();
        }),
        catchError(() => {
          this.snackBar.open('Failed to update user details', 'Close', { duration: 3000 });
          return of(null);
        })
      ).subscribe();
    }
  }
}