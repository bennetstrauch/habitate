import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { intitialState, StateService } from '../state.service';
import { AuthenticationComponent } from "./authentication.component";

@Component({
  selector: 'app-welcome',
  imports: [],
  template: `
    <div>
      Hey there :)
    Welcome to {{title}} !

    You are here to build up happy habbits,
    which help you pursue your goals
    in a natural, simple, non-straining way ?
    - Then you are in the perfectly right spot !

    ( GET STARTED )
    </div>
  `,
  styles: [],
})
export class WelcomeComponent {
  title = "' Habitate '";


}
