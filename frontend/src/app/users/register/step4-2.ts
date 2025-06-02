import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { dayColorMap } from '../../main/app.component';
import { ReflectionReminderComponent } from '../../reflections/reflection-reminder/reflection-reminder.component';

@Component({
  selector: 'app-register-step4-2',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    ReflectionReminderComponent,
  ],
  template: `
    <mat-card class="welcome-card">
      <mat-card-content>
        <p>
          Just in case you might forget to log on to our daily reflection, <br>
          <strong>would you like to set a reminder?</strong>
        </p>
        <br>
        <form [formGroup]="userDetailsForm">
          <app-reflection-reminder
            [userDetailsForm]="userDetailsForm"
            [backgroundColor]="todayColor"
          ></app-reflection-reminder>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    mat-card-content p {
      font-size: 1.1rem;
      color: #555;
      margin: 0.5rem 0;
    }

    .welcome-card {
      max-width: 600px;
      margin: 0 auto;
    }
  `],
})
export class Step4_2 {
  @Input({ required: true }) userDetailsForm!: FormGroup;
  showPushWarning = false;
  todayColor = dayColorMap[new Date().getDay()];
}