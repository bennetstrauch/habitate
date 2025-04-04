import { Component, inject, Input } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';

// # take out form, @input to input, globalize formFieldNames
@Component({
  selector: 'app-register-step4',
  imports: [
    MatOptionModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    MatInput,
    MatLabel,
    MatFormField,
    ReactiveFormsModule,
  ],
  template: `
    <div>
      <mat-card class="app-register-step4-2-reminder">
        <mat-card-content>
          <p>
            <!-- ## -->
            Would you also like to set a time in case you <br />
            have forgotten about the reflection that day? <br />
            <br />
            We would send a sweet reminder to your email then.

            <br />
            Enter your ' Reminder-Time ' here:
          </p>
          <br />

          <form [formGroup]="userDetailsForm">
            <mat-form-field>
              <mat-label>Reminder-Time:</mat-label>
              <mat-select formControlName="reflectionTrigger">
                @for(time of timeOptions; track $index) {
                <mat-option [value]="time">
                  {{ time }}
                </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .welcome-card {
        align-items: center;
        text-align: center;

        max-width: 500px;
        padding: 1rem;
        margin: 2rem;
        border-radius: 8px;

        background: #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

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
    `,
  ],
})
export class Step4_2Reminder {
  @Input() userDetailsForm!: FormGroup;

  timeOptions: string[] = [];

  ngOnInit() {
    this.generateTimeOptions();
  }

  generateTimeOptions() {
    const intervals = 15; // 15-minute intervals
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += intervals) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        this.timeOptions.push(`${hour}:${minute}`);
      }
    }
  }
}
