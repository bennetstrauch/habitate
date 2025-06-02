import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from './users.service';
import { User } from '@backend/users/users.types';
import { CommonModule } from '@angular/common';
import { validationRulesRegister } from '@global/auth/validationRules';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { PushSubscription as WebPushSubscription } from 'web-push';
import { animate, style, transition, trigger } from '@angular/animations';
import { ReflectionReminderComponent } from '../reflections/reflection-reminder/reflection-reminder.component';

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
    MatIconModule,
    ReflectionReminderComponent
    // #### change started here ####
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    <div class="notification" *ngIf="showPushWarning" @fadeInOut>
      <div class="notification-content">
        <span>Push Notifications are not always reliable. If you want to be sure, enable both :)</span>
        <button mat-icon-button (click)="dismissPushWarning()" aria-label="Dismiss notification">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>

    <form [formGroup]="editUserForm" class="form">
      <h2>Edit Your Details</h2>

      <mat-form-field appearance="outline" class="form-field">
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

      <mat-form-field appearance="outline" class="form-field">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" required />
        @if (editUserForm.get('email')?.hasError('required')) {
          <mat-error>Required</mat-error>
        } @else if (editUserForm.get('email')?.hasError('email')) {
          <mat-error>Invalid email format</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="form-field">
        <mat-label>Modified Password</mat-label>
        <input matInput type="password" formControlName="password" autocomplete="new-password" />
        @if (editUserForm.get('password')?.hasError('minlength')) {
          <mat-error>Minimum {{ validationRules.password.minLength }} characters</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="form-field">
        <mat-label>Reflection Trigger</mat-label>
        <input matInput formControlName="reflectionTrigger" />
      </mat-form-field>

      <app-reflection-reminder
        [userDetailsForm]="editUserForm" />
      
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

    .notification {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      width: 100%;
      max-width: 400px;
      padding: 0 16px;
      box-sizing: border-box;
    }

    .notification-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #323232;
      color: #fff;
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .notification-content span {
      flex-grow: 1;
      text-align: center;
    }

    .notification-content button {
      color: #fff;
    }

    :host ::ng-deep .mat-mdc-snack-bar-container.custom-snackbar {
      margin: 0 !important;
      padding: 0 !important;
      min-width: unset !important;
      width: auto !important;
      bottom: 24px !important;
      top: auto !important;
    }

    :host ::ng-deep .mat-mdc-snack-bar-container.custom-snackbar .mdc-snack-bar__surface {
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

    :host ::ng-deep .mat-mdc-snack-bar-container.custom-snackbar .mat-mdc-snack-bar-label {
      padding: 0 !important;
      margin: 0 4px 0 0 !important;
      text-align: center;
      flex-grow: 0;
      color: #fff !important;
      line-height: normal !important;
      min-width: unset !important;
    }

    :host ::ng-deep .mat-mdc-snack-bar-container.custom-snackbar .mdc-snack-bar__actions {
      margin: 0 !important;
      padding: 0 !important;
      flex-grow: 0;
    }

    :host ::ng-deep .mat-mdc-snack-bar-container.custom-snackbar .mdc-snack-bar__action {
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

  private unsavedChangesSnackBar: MatSnackBarRef<SimpleSnackBar> | null = null;

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
  showPushWarning = false;

  hasChanges = false;

  ngOnInit() {
    // Dynamically enable/disable time fields based on reminders
    this.editUserForm.get('enablePush')?.valueChanges.subscribe(() => {
      this.updateTimeFieldsState();
    });
    this.editUserForm.get('enableEmail')?.valueChanges.subscribe(() => {
      this.updateTimeFieldsState();
    });
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
        // Check initial push warning state
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
        if (this.unsavedChangesSnackBar) {
          this.unsavedChangesSnackBar.dismiss();
          this.unsavedChangesSnackBar = null;
        }
        this.hasChanges = false;
      }
    });
  }


  // ## do i need this?
  private updateTimeFieldsState() {
    const isEnabled = this.editUserForm.get('enablePush')?.value || this.editUserForm.get('enableEmail')?.value;
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
    if (!this.unsavedChangesSnackBar) {
      this.unsavedChangesSnackBar = this.snackBar.open('Unsaved changes', 'Save', {
        duration: 0,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['custom-snackbar']
      });

      this.unsavedChangesSnackBar.onAction().subscribe(() => {
        this.saveChanges();
      });

      this.unsavedChangesSnackBar.afterDismissed().subscribe(() => {
        this.unsavedChangesSnackBar = null;
      });
    }
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

      if (initialVal != currentVal) {
        if (typedKey === 'password' && !this.editUserForm.get('password')?.touched) {
          continue;
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
      const enableEmail = this.editUserForm.get('enableEmail')?.value || false;

      let reflectionReminderTime: string | undefined;
        if (enablePush || enableEmail) {
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