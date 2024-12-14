import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { intitialState, StateService } from '../state.service';
import { AuthenticationComponent } from "./authentication.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthenticationComponent],
  template: `

    <div class="main-container">

    <app-authentication />
    <router-outlet />

    </div>

  `,
  styles: [
    `.main-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #f4f4f4;
    }
    `
  ],
})
export class AppComponent {
  title = 'Habitate';

 
}
