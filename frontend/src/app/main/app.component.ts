import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthenticationComponent } from "../users/authentication.component";
import { NavigationComponent } from "./navigation.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent],
  template: `

    <div class="main-container">

      <app-navigation class="navigation"/>
      <router-outlet class="router-outlet"/>

    </div>

  `,
  styles: [
    `
    .main-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #f4f4f4;
      
    }
    
    `,
  ],
})
export class AppComponent {
  title = 'Habitate';

 
}
