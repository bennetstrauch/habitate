import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { intitialState, StateService } from '../state.service';
import { AuthenticationComponent } from "../main/authentication.component";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-welcome',
  imports: [MatCardModule, MatButtonModule, RouterModule],
  template: `

    <div>
      <mat-card class="welcome-card">

        <mat-card-header>
          <p mat-card-title>Welcome to {{ title }}!</p>
        </mat-card-header>
        <br>

        <mat-card-content>
          <p>
            Hey there! 😊
            <br /> <br>
            You are here to build up happy habits <br>
            that help you pursue your goals <br>
            in a <strong>natural, simple, and non-straining </strong> way ? 
          </p>
          <br>
          <p>
            - Then you are in the perfectly right spot !
          </p>
        </mat-card-content>

        <mat-card-actions>
        
          <button mat-raised-button color="primary" [routerLink]="['','register']"> Get Started </button>
        </mat-card-actions>

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
export class WelcomeComponent {
  title = "' Habitate '";
  #stateService = inject(StateService)
  #router = inject(Router)

  // good way? #
  redirectEffect = effect(() => {
    if (this.#stateService.isLoggedIn()) {
      this.#router.navigate(['', 'goals'])
    }
  })


}
