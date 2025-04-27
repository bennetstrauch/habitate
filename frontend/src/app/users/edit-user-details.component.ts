import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { UsersService } from './users.service';
import { User } from '@backend/users/users.types';
import { CommonModule } from '@angular/common';
import { validationRulesRegister } from '@global/auth/validationRules';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { PushSubscription as WebPushSubscription } from 'web-push';

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
  ],
  template: `
    <form [formGroup]="editUserForm" class="form">
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
        <mat-label>Modified Password</mat-label>
        <input matInput type="password" formControlName="password" autocomplete="new-password" />
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
          <mat-checkbox formControlName="enablePush">Push Notifications</mat-checkbox>
          <mat-checkbox formControlName="enableEmail">Email Notifications</mat-checkbox>
        </div>

        <div class="time-selector">
          <mat-form-field class="time-field">
            <mat-label>Hour</mat-label>
            <mat-select formControlName="hour">
              @for (hour of hours; track hour) {
                <mat-option [value]="hour">{{ hour }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field class="time-field">
            <mat-label>Minute</mat-label>
            <mat-select formControlName="minute">
              @for (minute of minutes; track minute) {
                <mat-option [value]="minute">{{ minute }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field class="time-field">
            <mat-label>Period</mat-label>
            <mat-select formControlName="period">
              @for (period of periods; track period) {
                <mat-option [value]="period">{{ period }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </div>
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

:host ::ng-deep .mat-mdc-snack-bar-container {
  margin: 0 !important;
  padding: 0 !important;
  min-width: unset !important;
  width: auto !important;
}

:host ::ng-deep .mat-mdc-snack-bar-container .mdc-snack-bar__surface {
  padding: 4px !important;
  min-width: unset !important;
  width: auto !important;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #323232 !important;
  border-radius: 4px !important;
  flex-wrap: nowrap !important;
}

:host ::ng-deep .mat-mdc-snack-bar-container .mat-mdc-snack-bar-label {
  padding: 0 !important;
  margin: 0 4px 0 0 !important;
  text-align: center;
  flex-grow: 0;
  color: #fff !important;
  line-height: normal !important;
  min-width: unset !important;
}

:host ::ng-deep .mat-mdc-snack-bar-container .mdc-snack-bar__actions {
  margin: 0 !important;
  padding: 0 !important;
  flex-grow: 0;
}

:host ::ng-deep .mat-mdc-snack-bar-container .mdc-snack-bar__action {
  padding: 0 !important;
  margin: 0 !important;
  color: #bb86fc !important;
  line-height: normal !important;
  min-width: unset !important;
}

  `]
})
export class EditUserDetailsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);

  editUserForm = this.formBuilder.group({
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

  validationRules = validationRulesRegister;
  hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')); // 01 to 12
  minutes = ['00', '15', '30', '45'];
  periods = ['AM', 'PM'];
  private pushSubscription: PushSubscription | null = null;
  private initialFormValue: any = null;

  hasChanges = false;

  ngOnInit() {
    // Dynamically enable/disable time fields based on reminders
    this.editUserForm.get('enablePush')?.valueChanges.subscribe(() => this.updateTimeFieldsState());
    this.editUserForm.get('enableEmail')?.valueChanges.subscribe(() => this.updateTimeFieldsState());
    this.updateTimeFieldsState(); // Initial state

    // Load user details
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
        this.editUserForm.patchValue({
          name: user.name,
          email: user.email,
          password: '', // Do not prefill password
          reflectionTrigger: user.reflectionTrigger,
          enablePush: user.reflectionDetails.enablePush,
          enableEmail: user.reflectionDetails.enableEmail,
          hour,
          minute,
          period
        });
        // Store initial form value after patching
        this.initialFormValue = this.editUserForm.getRawValue();
      },
      error: () => {
        this.snackBar.open('Failed to load user details', 'Close', { duration: 3000 });
      }
    });

    // Watch for form value changes
    this.editUserForm.valueChanges.subscribe(() => {
      if (this.editUserForm.valid && this.hasFormChanged()) {
        if (!this.hasChanges) {
          this.showSavePrompt();
          this.hasChanges = true;
        }
      } else if (this.hasChanges && !this.hasFormChanged()) {
        this.snackBar.dismiss();
        this.hasChanges = false;
      }
    });
  }

  private updateTimeFieldsState() {
    const isEnabled = this.isReminderEnabled();
    ['hour', 'minute', 'period'].forEach(field => {
      const control = this.editUserForm.get(field);
      if (isEnabled) {
        control?.enable({ emitEvent: false });
      } else {
        control?.disable({ emitEvent: false });
      }
    });
  }

  private showSavePrompt() {
    // ## want to remove the entire left side of the snackbar

    this.snackBar.open('Unsaved changes', 'Save', {
      duration: 0,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['custom-snackbar']
    }).onAction().subscribe(() => {
      this.saveChanges();
    });
  }

  private hasFormChanged(): boolean {
    if (!this.initialFormValue) {
      return false;
    }

    const currentValue = this.editUserForm.getRawValue();
    const initialFormKeys = Object.keys(this.initialFormValue);

    for (const key of initialFormKeys) {
      const typedKey = key as keyof typeof currentValue;
      const initialVal = this.initialFormValue[typedKey];
      const currentVal = currentValue[typedKey];

      // Handle null/undefined and string comparison
      if (initialVal != currentVal) {
        if (typedKey === 'password' && !this.editUserForm.get('password')?.touched) {
          continue; // Ignore untouched password changes
        }
        console.log(`Field changed: ${key} from ${initialVal} to ${currentVal}`);
        return true;
      }
    }
    return false;
  }

  async handlePushSubscription(enablePush: boolean): Promise<PushSubscription | null> {
    if (!enablePush) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
        return null;
      } catch (error) {
        console.error('Failed to unsubscribe:', error);
        return null;
      }
    }

    try {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      const applicationServerKey = this.urlBase64ToUint8Array(environment.vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      this.snackBar.open('Failed to enable push notifications', 'Close', { duration: 3000 });
      return null;
    }
  }

  async saveChanges() {
    if (this.editUserForm.valid) {
      const enablePush = this.editUserForm.get('enablePush')?.value || false;
      this.pushSubscription = await this.handlePushSubscription(enablePush);

      let reflectionReminderTime: string | undefined;
      if (this.isReminderEnabled()) {
        const hour = parseInt(this.editUserForm.get('hour')?.value || '08');
        const minute = this.editUserForm.get('minute')?.value;
        const period = this.editUserForm.get('period')?.value;
        const adjustedHour = period === 'PM' && hour < 12 ? hour + 12 : period === 'AM' && hour === 12 ? 0 : hour;
        reflectionReminderTime = `${adjustedHour.toString().padStart(2, '0')}:${minute}`;
      }

      const updatedUser: Partial<User> = {
        name: this.editUserForm.get('name')?.value || undefined,
        email: this.editUserForm.get('email')?.value || undefined,
        password: this.editUserForm.get('password')?.touched ? this.editUserForm.get('password')?.value || undefined : undefined,
        reflectionTrigger: this.editUserForm.get('reflectionTrigger')?.value ?? undefined,
        reflectionDetails: {
          enablePush,
          enableEmail: this.editUserForm.get('enableEmail')?.value || false,
          reflectionReminderTime,
          pushSubscription: this.pushSubscription ? this.pushSubscription.toJSON() as WebPushSubscription : undefined
        }
      };

      this.usersService.updateUser(updatedUser).pipe(
        tap(() => {
          this.snackBar.open('User details updated successfully', 'Close', { duration: 3000 });
          this.hasChanges = false;
          this.editUserForm.markAsPristine();
          this.initialFormValue = this.editUserForm.getRawValue();
        }),
        catchError((error) => {
          this.snackBar.open('Failed to update user details', 'Close', { duration: 3000 });
          return of(null);
        })
      ).subscribe();
    }
  }

  isReminderEnabled(): boolean {
    return (this.editUserForm.get('enablePush')?.value || this.editUserForm.get('enableEmail')?.value) ?? false;
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