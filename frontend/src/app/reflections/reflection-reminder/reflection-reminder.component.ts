import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
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
        <span>Push Notifications are not always reliable. If you want to be sure, enable both :)</span>
        <button mat-icon-button (click)="dismissPushWarning()" aria-label="Dismiss notification">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>

    <form [formGroup]="userDetailsForm">
      <div class="card" [style.background-color]="backgroundColor">
        <h3>Reflection Reminder</h3>
        <div class="checkbox-group">
          <mat-checkbox formControlName="enablePush">Push Notifications for this device</mat-checkbox>
          <mat-checkbox formControlName="enableEmail">Email Notifications</mat-checkbox>
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

  private reflectionReminderService = inject(ReflectionReminderService);
  private usersService = inject(UsersService);

  async ngOnInit() {
    // Initialize enablePush based on current device subscription
    try {
      const userDetails = await firstValueFrom(this.usersService.getUserDetails());
      const existingSubscriptions = userDetails?.data.reflectionDetails.pushSubscriptions || [];
      const isDeviceSubscribed = await this.reflectionReminderService.isCurrentDeviceSubscribed(existingSubscriptions);
      this.userDetailsForm.get('enablePush')?.setValue(isDeviceSubscribed, { emitEvent: false });
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      this.userDetailsForm.get('enablePush')?.setValue(false, { emitEvent: false });
    }

    // Dynamically show/hide push warning and enable/disable time fields
    this.userDetailsForm.get('enablePush')?.valueChanges.subscribe(() => {
      this.updatePushWarning();
    });
    this.userDetailsForm.get('enableEmail')?.valueChanges.subscribe(() => {
      this.updatePushWarning();
    });
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
}