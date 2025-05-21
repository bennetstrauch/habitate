import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { intitialState, StateService } from '../../state.service';
import { AuthenticationButtonComponent } from '../authentication.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register-step3',
  imports: [MatCardModule, MatButtonModule, RouterModule],
  template: `
    <div>
      <mat-card class="welcome-card">
        <mat-card-content>
          <p>
            To take the strain out<br />
            of scheduling something every time, <br />
            <br />
            our daily meeting should be like brushing your teeth. <br />
            - Nothing to think about.
            <!-- Not giving it a second thought # -->
          </p>
          <br />
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
    `,
  ],
})
export class Step3 {}
