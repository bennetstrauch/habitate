import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthenticationButtonComponent } from '../users/authentication.component';
import { NavigationComponent } from './navigation.component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent, NgStyle],
  template: `
    <div class="main-container" [ngStyle]="{ 'background-color': todayColor }">
      <app-navigation class="navigation" />
      <router-outlet class="router-outlet" />
    </div>
  `,
  styles: [
    `
      .main-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: rgb(250, 229, 197); /* Goldish */
        min-height: 100vh; /* Ensure it takes full viewport height */
        width: 100vw; /* Ensure it takes full viewport width */
        margin: 0; /* Remove any default margins */
        padding: 0;
        box-sizing: border-box; /* Ensure padding/borders don't add to size */
      }
    `,
  ],
})
export class AppComponent {
  title = 'Habitate';

  dayColorMap: { [key: number]: string } = {
    0: 'rgb(250, 229, 197)', // Sunday - Goldish
    1: 'rgb(250, 250, 250)', // Monday - White
    2: 'rgb(250, 221, 221)', // Tuesday - Light Red
    3: '#C8E6C9', // Wednesday - Light Green
    4: '#FFE0B2', // Thursday - Light Orange
    5: 'rgb(208, 245, 247)', // Friday - Light Cyan
    6: '#BBDEFB', // Saturday - Light Blue
  };

  todayColor = this.dayColorMap[new Date().getDay()];
}