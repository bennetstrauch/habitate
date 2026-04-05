import { Component, inject, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation.component';
import { NgStyle } from '@angular/common';
import { SuggestionReplyModalComponent } from '../suggestion-replies/suggestion-reply-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent, NgStyle, SuggestionReplyModalComponent],
  template: `
    <div class="main-container" [ngStyle]="{ 'background-color': todayColor }">
      <app-navigation class="navigation" />
      @if ($routerLoading()) {
        <div class="loading-wrap">
          <div class="spinner"></div>
        </div>
      }
      <router-outlet class="router-outlet" />
    </div>
    <app-suggestion-reply-modal />
  `,
  styles: [
    `
      .main-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: rgb(250, 229, 197);
        min-height: 100vh;
        width: 100vw;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .loading-wrap {
        display: flex;
        justify-content: center;
        padding: 60px 0;
        width: 100%;
      }

      .spinner {
        width: 36px;
        height: 36px;
        border: 3px solid rgba(0, 0, 0, 0.12);
        border-top-color: rgba(0, 0, 0, 0.38);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ],
})
export class AppComponent {
  title = 'Habitate';
  todayColor = dayColorMap[new Date().getDay()];

  $routerLoading = signal(false);

  constructor() {
    inject(Router).events.subscribe(event => {
      if (event instanceof NavigationStart) this.$routerLoading.set(true);
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) this.$routerLoading.set(false);
    });
  }
}

export const dayColorMap: { [key: number]: string } = {
  0: 'rgb(250, 229, 197)', // Sunday
  2: 'rgb(250, 221, 221)', // Tuesday
  3: '#C8E6C9',            // Wednesday
  4: '#FFE0B2',            // Thursday
  5: 'rgb(208, 245, 247)', // Friday
  6: '#BBDEFB',            // Saturday
};
