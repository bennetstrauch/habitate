import { Component, inject, input } from '@angular/core';
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
  selector: 'app-register-step5',
  imports: [MatCardModule, MatButtonModule, RouterModule],
  template: `
    <div>
      <mat-card>
        <mat-card-content>
          <p>
            Great! <br />
            So every day after your trigger:
            <strong>{{ reflectionTrigger() }}</strong> <br />
            you can open your ' habitate ' <br />
            and we'll guide you through this <br />
            short but insightful reflection process. <br />
          </p>
          <br />
        
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [``],
})
export class Step5 {
  readonly reflectionTrigger = input.required<string>();
}
