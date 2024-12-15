import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { intitialState, StateService } from '../../state.service';
import { AuthenticationComponent } from "../../main/authentication.component";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-register-step2',
  imports: [MatCardModule, MatButtonModule, MatStepperModule],
  template: `

    <div>
      <mat-card class="welcome-card">

        <mat-card-content>
          <p>
            We want to keep it simple & easy.
            <br /> <br>
            To help you get into the flow and stay there, <br>
            it will be very valuable if we can <br>
            connect once a day for a few minutes. 
          </p>
          <br>
         
        </mat-card-content>

      </mat-card>
    </div>

  `,
  styles: [
    `
      .welcome-card {

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
export class Step2 {
  
}
