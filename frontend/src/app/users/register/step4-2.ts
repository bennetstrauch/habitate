import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, NgClass } from '@angular/common';
import { dayColorMap } from '../../main/app.component';

@Component({
  selector: 'app-register-step4-2',
  imports: [
    MatCardModule,
    MatButtonModule,
    RouterModule,
    MatInput,
    MatLabel,
    MatFormField,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatIconModule,
    NgClass,
    CommonModule
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

    <div>
      <mat-card class="welcome-card">
        <mat-card-content>
          <p>
            Just in case you might forget to logon to our daily reflection, <br>
            <strong> would you like to set a reminder? </strong>
          </p>
          <br>

          <form [formGroup]="userDetailsForm">
            <div class="card" [style.background-color]="todayColor">
              <h3>Reflection Reminder</h3>
              <div class="checkbox-group">
                <mat-checkbox formControlName="enablePush">Push Notifications</mat-checkbox>
                <mat-checkbox formControlName="enableEmail">Email Notifications</mat-checkbox>
              </div>

              <div class="time-selector" [ngClass]="{ 'disabled': !isReminderEnabled() }">
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
                  <mat-select formControlName="period" [disabled]="!isReminderEnabled()">
                    @for (period of periods; track period) {
                      <mat-option [value]="period">{{ period }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            </div>
          </form> 
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      mat-card-title {
        color: #00796b;
        font-size: 1.8rem;
        font-weight: bold;
      }

      mat-card-content p {
        font-size: 1.1rem;
        color: #555;
        margin: 0.5rem 0;
      }

      mat-card-actions button {
        margin-top: 1rem;
      }

      .card {
        padding: 16px;
        background-color: #f9f9f9;
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
      }
    `,
  ],
})
export class Step4_2 implements OnInit {
  @Input() userDetailsForm!: FormGroup;

  hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')); // 01 to 12
  minutes = ['00', '15', '30', '45'];
  periods = ['AM', 'PM'];
  showPushWarning = false;

  ngOnInit() {
    // Dynamically show/hide push warning and enable/disable time fields
    this.userDetailsForm.get('enablePush')?.valueChanges.subscribe(() => {
      this.updatePushWarning();
    });
    this.userDetailsForm.get('enableEmail')?.valueChanges.subscribe(() => {
      this.updatePushWarning();
    });
    this.updatePushWarning(); // Initial state
  }

  isReminderEnabled(): boolean {
    return (this.userDetailsForm.get('enablePush')?.value || this.userDetailsForm.get('enableEmail')?.value) ?? false;
  }

  updatePushWarning() {
    const pushEnabled = this.userDetailsForm.get('enablePush')?.value ?? false;
    const emailEnabled = this.userDetailsForm.get('enableEmail')?.value ?? false;
    this.showPushWarning = pushEnabled && !emailEnabled;
  }

  dismissPushWarning() {
    this.showPushWarning = false;
  }

  todayColor = dayColorMap[new Date().getDay()];
}