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
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-register-step6',
  imports: [MatCardModule, MatButtonModule, RouterModule, MatIcon],
  template: `
    <div>
      <mat-card class="welcome-card">
        <mat-card-content>
          <p>
            <strong
              >This reflection is a core part of cultivating your habits easily
              and effectively.</strong
            >
            <br />
            <!-- <span style="font-size: 4rem;">🌅</span>  -->
             ~
            <br />
            Even if you don't do anything that day, no judgement! <br />
            <strong>Even then, just reflect with us.</strong> <br />
            You will be happy you did :) <br />
          </p>
       
          <p>
            <span style="font-size: 4rem;">🥳</span> <br>
            <strong> Welcome on board ! </strong>
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [``],
})
export class Step6 {}
