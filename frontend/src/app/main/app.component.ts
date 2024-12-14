import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { intitialState, StateService } from '../state.service';
import { AuthenticationComponent } from "./authentication.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthenticationComponent],
  template: `
    <h1>Welcome to {{title}}!</h1>

    <app-authentication />
    <router-outlet />

  `,
  styles: [],
})
export class AppComponent {
  title = 'Habitate';

 
}
