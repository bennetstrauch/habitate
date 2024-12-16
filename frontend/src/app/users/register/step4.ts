import { Component, inject, Input } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

// # take out form, @input to input, globalize formFieldNames
@Component({
  selector: 'app-register-step4',
  imports: [MatCardModule, MatButtonModule, RouterModule, MatInput, MatLabel, MatFormField, ReactiveFormsModule],
  template: `

    <div>
      <mat-card class="app-register-step4">

      
        <mat-card-content>
          <p>
            Think about something you already do every day <br> 
            ( preferrably at night ) <br>
            and just shedule our <strong> ' Habit-Reflection ' </strong> right after. <br>
            <br>
            Enter this ' Reflection-Trigger ' here: 
          </p>
          <br>


          <form [formGroup]="userDetailsForm">
    
            <mat-form-field>
              <mat-label> Reflection-Trigger: </mat-label>
              <input matInput placeholder="eg. toothbrushing" formControlName="reflectionTrigger" >
            </mat-form-field> <br>

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
export class Step4 {
  
  @Input() userDetailsForm!: FormGroup;

}
