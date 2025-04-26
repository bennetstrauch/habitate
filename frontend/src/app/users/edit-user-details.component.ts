import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatError } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UsersService } from './users.service';
import { User } from '@backend/users/users.types';
import { CommonModule } from '@angular/common';
import { validationRulesRegister } from '@global/auth/validationRules';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { PushSubscription as WebPushSubscription } from 'web-push'; // Import for backend format

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
    MatSelectModule,
    MatError,
  ],
  template: `
    <form [formGroup]="editUserForm" (ngSubmit)="saveChanges()" class="form">
      <h2>Edit Your Details</h2>

      <mat-form-field class="form-field">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" required />
        @if (editUserForm.get('name')?.hasError('required')) {
          <mat-error>Required</mat-error>
        } @else if (editUserForm.get('name')?.hasError('minlength')) {
          <mat-error>Minimum {{ validationRules.name.minLength }} characters</mat-error>
        } @else if (editUserForm.get('name')?.hasError('maxlength')) {
          <mat-error>Maximum {{ validationRules.name.maxLength }} characters</mat-error>
        }
      </mat-form-field>

      <mat-form-field class="form-field">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" required />
        @if (editUserForm.get('email')?.hasError('required')) {
          <mat-error>Required</mat-error>
        } @else if (editUserForm.get('email')?.hasError('email')) {
          <mat-error>Invalid email format</mat-error>
        }
      </mat-form-field>

      <mat-form-field class="form-field">
        <mat-label>Password</mat-label>
        <input matInput type="password" formControlName="password" />
        @if (editUserForm.get('password')?.hasError('minlength')) {
          <mat-error>Minimum {{ validationRules.password.minLength }} characters</mat-error>
        }
      </mat-form-field>

      <mat-form-field class="form-field">
        <mat-label>Reflection Trigger</mat-label>
        <input matInput formControlName="reflectionTrigger" />
      </mat-form-field>

      <div class="card">
        <h3>Reflection Reminders</h3>
        <div class="checkbox-group">
          <mat-checkbox formControlName="enablePush" (change)="onPushChange($event.checked)">Push Notifications</mat-checkbox>
          <mat-checkbox formControlName="enableEmail">Email Notifications</mat-checkbox>
        </div>

        <div [ngClass]="{ disabled: !isReminderEnabled() }" class="time-selector">
          <mat-form-field class="time-field">
            <mat-label>Hour</mat-label>
            <mat-select formControlName="hour" [disabled]="!isReminderEnabled()">
              @for (hour of hours; track hour) {
                <mat-option [value]="hour">{{ hour }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field class="time-field">
            <mat-label>Minute</mat-label>
            <mat-select formControlName="minute" [disabled]="!isReminderEnabled()">
              @for (minute of minutes; track minute) {
                <mat-option [value]="minute">{{ minute }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field class="time-field">
            <mat-label>Period</mat-label>
            <mat-select formControlName="period" 
            [disabled]="!isReminderEnabled()"
            >
              @for (period of periods; track period) {
                <mat-option [value]="period">{{ period }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <button
        mat-raised-button
        color="primary"
        type="submit"
        [disabled]="!editUserForm.valid || !editUserForm.dirty"
      >
        Save Changes
      </button>
    </form>
  `,
  styles: [`
    .form {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .form-field {
      width: 100%;
      max-width: 400px;
      margin-bottom: 8px;
    }

    .card {
      padding: 16px;
      margin: 16px 0;
      width: 100%;
      max-width: 400px;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
    }

    .time-selector {
      display: flex;
      gap: 10px;
    }

    .time-field {
      width: 80px;
    }

    .disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  `]
})
export class EditUserDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);

  editUserForm: FormGroup;
  validationRules = validationRulesRegister;
  hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')); // 01 to 12
  minutes = ['00', '15', '30', '45'];
  periods = ['AM', 'PM'];
  private pushSubscription: PushSubscription | null = null; // Use native PushSubscription

  constructor() {
    this.editUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(validationRulesRegister.name.minLength), Validators.maxLength(validationRulesRegister.name.maxLength)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(validationRulesRegister.password.minLength)]],
      reflectionTrigger: [''],
      enablePush: [false],
      enableEmail: [false],
      hour: ['08'],
      minute: ['15'],
      period: ['PM']
    });
  }

  async ngOnInit() {
    this.usersService.getUserDetails().subscribe({
      next: (response) => {
        const user = response.data;
        let hour = '08', minute = '15', period = 'PM';
        if (user.reflectionDetails.reflectionReminderTime) {
          const time = user.reflectionDetails.reflectionReminderTime;
          [hour, minute] = time.split(':');
          if (parseInt(hour) > 12) {
            hour = (parseInt(hour) - 12).toString().padStart(2, '0');
            period = 'PM';
          } else if (parseInt(hour) === 12) {
            period = 'PM';
          } else if (parseInt(hour) === 0) {
            hour = '12';
            period = 'AM';
          }
        }
        console.log('User details:', user);
        this.editUserForm.patchValue({
          name: user.name,
          email: user.email,
          reflectionTrigger: user.reflectionTrigger,
          enablePush: user.reflectionDetails.enablePush,
          enableEmail: user.reflectionDetails.enableEmail,
          hour,
          minute,
          period
        });
      },
      error: () => {
        this.snackBar.open('Failed to load user details', 'Close', { duration: 3000 });
      }
    });
  }

  async onPushChange(checked: boolean): Promise<void> {
    console.log('Push notifications enabled:', checked);
    if (checked) {
      try {
        console.log('Inside try');
        // Check notification permission
        console.log('Checking notification permission...');
        if (Notification.permission !== 'granted') {
          console.log('Requesting notification permission...');
          const permission = await Notification.requestPermission();
          console.log('Permission result:', permission);
          if (permission !== 'granted') {
            throw new Error('Notification permission denied');
          }
        }
        // Verify service worker
        console.log('Waiting for service worker to be ready...');
        const registration: ServiceWorkerRegistration = await navigator.serviceWorker.ready;
        console.log('Service worker registration:', registration);
        if (!registration) {
          throw new Error('Service worker not registered');
        }
        // Check for existing subscription
        console.log('Checking for existing subscription...');
        const existingSubscription: PushSubscription | null = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          console.log('Unsubscribing existing subscription:', existingSubscription);
          await existingSubscription.unsubscribe();
        }
        // Log VAPID key
        console.log('VAPID Public Key:', environment.vapidPublicKey);
        const applicationServerKey: Uint8Array = this.urlBase64ToUint8Array(environment.vapidPublicKey);
        console.log('Application Server Key:', applicationServerKey);
        // Subscribe to push notifications
        console.log('Subscribing to push notifications...');
        const subscription: PushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
        console.log('Push subscription:', subscription);
        if (!subscription) {
          throw new Error('Push subscription is null');
        }
        this.pushSubscription = subscription;
        console.log('Push subscription JSON:', this.pushSubscription.toJSON());
        this.snackBar.open('Push notifications enabled', 'Close', { duration: 3000 });
      } catch (error: unknown) {
        console.error('Failed to subscribe to push notifications:', error);
        this.editUserForm.patchValue({ enablePush: false });
        this.pushSubscription = null;
        this.snackBar.open('Failed to enable push notifications', 'Close', { duration: 3000 });
      }
    } else {
      console.log('Disabling push notifications...');
      this.pushSubscription = null;
      try {
        const registration: ServiceWorkerRegistration = await navigator.serviceWorker.ready;
        const subscription: PushSubscription | null = await registration.pushManager.getSubscription();
        if (subscription) {
          console.log('Unsubscribing from push notifications:', subscription);
          await subscription.unsubscribe();
        }
      } catch (error: unknown) {
        console.error('Failed to unsubscribe:', error);
      }
    }
  }

  isReminderEnabled(): boolean {
    return this.editUserForm.get('enablePush')?.value || this.editUserForm.get('enableEmail')?.value;
  }

  saveChanges() {
    if (this.editUserForm.valid) {
      let reflectionReminderTime: string | undefined;
      if (this.isReminderEnabled()) {
        const hour = parseInt(this.editUserForm.get('hour')?.value);
        const minute = this.editUserForm.get('minute')?.value;
        const period = this.editUserForm.get('period')?.value;
        const adjustedHour = period === 'PM' && hour < 12 ? hour + 12 : period === 'AM' && hour === 12 ? 0 : hour;
        reflectionReminderTime = `${adjustedHour.toString().padStart(2, '0')}:${minute}`;
      }
      const updatedUser: Partial<User> = {
        name: this.editUserForm.get('name')?.value,
        email: this.editUserForm.get('email')?.value,
        password: this.editUserForm.get('password')?.value || undefined,
        reflectionTrigger: this.editUserForm.get('reflectionTrigger')?.value,
        reflectionDetails: {
          enablePush: this.editUserForm.get('enablePush')?.value,
          enableEmail: this.editUserForm.get('enableEmail')?.value,
          reflectionReminderTime,
          pushSubscription: this.pushSubscription ? this.pushSubscription.toJSON() as WebPushSubscription : undefined // Convert to web-push format
        }
      };
      console.log('Sending updated user data:', updatedUser);
      this.usersService.updateUser(updatedUser).pipe(
        tap((response) => {
          console.log('Update user response:', response);
          this.snackBar.open('User details updated successfully', 'Close', { duration: 3000 });
          this.editUserForm.markAsPristine();
        }),
        catchError((error: unknown) => {
          console.error('Failed to update user:', error);
          this.snackBar.open('Failed to update user details', 'Close', { duration: 3000 });
          return of(null);
        })
      ).subscribe();
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}