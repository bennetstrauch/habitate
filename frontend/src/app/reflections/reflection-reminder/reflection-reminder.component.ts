import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, NgClass } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { ReflectionReminderService } from './reflection-reminder.service';
import { PushSubscription as WebPushSubscription } from 'web-push';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../../users/users.service';

@Component({
  selector: 'app-reflection-reminder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    NgClass,
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [style({ opacity: 0 }), animate('150ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))]),
    ]),
  ],
  template: `
    <div class="notification" *ngIf="showPushWarning()" @fadeInOut>
      <div class="notification-content">
        <span>Push notifications are only reliable when paired with email. Enable both for the best experience.</span>
        <button mat-icon-button (click)="dismissPushWarning()" aria-label="Dismiss">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>

    <!-- Push prompt for second reminder -->
    <div class="push-prompt-backdrop" *ngIf="showPushPrompt()" @fadeInOut>
      <div class="push-prompt">
        <p>Push notifications aren't enabled on this device. Without them, the second reminder won't be delivered unless you enable email for it. Would you like to enable push notifications now?</p>
        <div class="push-prompt-actions">
          <button mat-button (click)="onPushPromptNo()">No, use email</button>
          <button mat-raised-button color="primary" (click)="onPushPromptYes()">Enable push</button>
        </div>
      </div>
    </div>

    <form [formGroup]="userDetailsForm">
      <div class="card" [style.background-color]="backgroundColor">
        <h3>Reflection Reminder</h3>
        <div class="checkbox-group">
          <mat-checkbox formControlName="enablePush">Push notifications for this device</mat-checkbox>
          <mat-checkbox formControlName="enableEmail">Email notifications</mat-checkbox>
        </div>

        <div class="time-selector" [ngClass]="{ 'disabled': !isReminderEnabled() }">
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

        <!-- Add second reminder -->
        @if (!showSecondReminder()) {
          <button mat-button class="add-reminder-btn" (click)="addSecondReminder()" [disabled]="!isReminderEnabled()">
            <mat-icon>add_circle_outline</mat-icon> Add a second reminder
          </button>
        }

        <!-- Second reminder block -->
        @if (showSecondReminder()) {
          <div class="second-reminder" @fadeInOut>
            <div class="second-reminder-header">
              <span class="second-reminder-label">Second reminder</span>
              <button mat-icon-button class="remove-btn" (click)="removeSecondReminder()" aria-label="Remove second reminder">
                <mat-icon>remove_circle_outline</mat-icon>
              </button>
            </div>

            <div class="time-selector">
              <mat-form-field class="time-field">
                <mat-label>Hour</mat-label>
                <mat-select formControlName="hour2">
                  @for (hour of hours; track hour) {
                    <mat-option [value]="hour">{{ hour }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="time-field">
                <mat-label>Minute</mat-label>
                <mat-select formControlName="minute2">
                  @for (minute of minutes; track minute) {
                    <mat-option [value]="minute">{{ minute }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field class="time-field">
                <mat-label>Period</mat-label>
                <mat-select formControlName="period2">
                  @for (period of periods; track period) {
                    <mat-option [value]="period">{{ period }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <mat-checkbox formControlName="enableEmail2">Also send an email for this reminder</mat-checkbox>
          </div>
        }
      </div>
    </form>
  `,
  styles: [
    `
      .card {
        padding: 16px;
        width: 80%;
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

      .add-reminder-btn {
        margin-top: 12px;
        color: gray;
        font-size: 0.85em;
      }

      .second-reminder {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid rgba(0,0,0,0.1);
      }

      .second-reminder-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .second-reminder-label {
        font-size: 0.9em;
        color: gray;
      }

      .remove-btn {
        color: gray;
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
        background: none;
        border: none;
        box-shadow: none;
      }

      .push-prompt-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        z-index: 1001;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }

      .push-prompt {
        background: #fff;
        color: #333;
        border-radius: 8px;
        padding: 24px;
        max-width: 360px;
        width: 100%;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      }

      .push-prompt p {
        margin: 0 0 20px;
        font-size: 14px;
        line-height: 1.5;
      }

      .push-prompt-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ],
})
export class ReflectionReminderComponent implements OnInit {
  @Input({ required: true }) userDetailsForm!: FormGroup;
  @Input() backgroundColor: string = '#f9f9f9';

  hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  minutes = ['00', '15', '30', '45'];
  periods = ['AM', 'PM'];

  showPushWarning = signal(false);
  isReminderEnabled = signal(false);
  showSecondReminder = signal(false);
  showPushPrompt = signal(false);

  private reflectionReminderService = inject(ReflectionReminderService);
  private usersService = inject(UsersService);

  async ngOnInit() {
    try {
      const userDetails = await firstValueFrom(this.usersService.getUserDetails());
      const existingSubscriptions = userDetails?.data.reflectionDetails.pushSubscriptions || [];
      const isDeviceSubscribed = await this.reflectionReminderService.isCurrentDeviceSubscribed(existingSubscriptions);
      this.userDetailsForm.get('enablePush')?.setValue(isDeviceSubscribed, { emitEvent: false });
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      this.userDetailsForm.get('enablePush')?.setValue(false, { emitEvent: false });
    }

    // Show second reminder block if a second time is already set
    if (this.userDetailsForm.get('hour2')?.value) {
      this.showSecondReminder.set(true);
    }

    this.userDetailsForm.get('enablePush')?.valueChanges.subscribe(() => this.updatePushWarning());
    this.userDetailsForm.get('enableEmail')?.valueChanges.subscribe(() => this.updatePushWarning());
    this.updatePushWarning();
  }

  updatePushWarning() {
    const pushEnabled = this.userDetailsForm.get('enablePush')?.value ?? false;
    const emailEnabled = this.userDetailsForm.get('enableEmail')?.value ?? false;
    this.showPushWarning.set(pushEnabled && !emailEnabled);
    this.isReminderEnabled.set(pushEnabled || emailEnabled);
  }

  dismissPushWarning() {
    this.showPushWarning.set(false);
  }

  async addSecondReminder() {
    const pushEnabled = this.userDetailsForm.get('enablePush')?.value ?? false;

    if (!pushEnabled) {
      // Check if this device actually has an active subscription
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!sub) {
          this.showPushPrompt.set(true);
          return;
        }
      } catch {
        this.showPushPrompt.set(true);
        return;
      }
    }

    this.showSecondReminder.set(true);
  }

  async onPushPromptYes() {
    this.showPushPrompt.set(false);
    try {
      const userDetails = await firstValueFrom(this.usersService.getUserDetails());
      const existing = userDetails?.data.reflectionDetails.pushSubscriptions || [];
      await this.reflectionReminderService.handlePushSubscription(true, existing);
      this.userDetailsForm.get('enablePush')?.setValue(true);
    } catch {
      // If push fails, fall back to email
      this.userDetailsForm.get('enableEmail2')?.setValue(true);
    }
    this.showSecondReminder.set(true);
  }

  onPushPromptNo() {
    this.showPushPrompt.set(false);
    this.userDetailsForm.get('enableEmail2')?.setValue(true);
    this.showSecondReminder.set(true);
  }

  removeSecondReminder() {
    this.showSecondReminder.set(false);
    this.userDetailsForm.patchValue({ hour2: null, minute2: '00', period2: 'PM', enableEmail2: false });
  }
}
