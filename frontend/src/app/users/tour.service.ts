import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'frontend/src/environments/environment';
import { JoyrideService } from 'ngx-joyride';
import { StandardResponse } from '@backend/types/standardResponse';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private joyrideService = inject(JoyrideService);
  private http = inject(HttpClient);
  private baseUrl = environment.SERVER_URL + '/users';

  /** null = not yet fetched this session, true/false = cached */
  private $tourCompleted = signal<boolean | null>(null);

  /** Call once per component init. Only hits the API the first time per session. */
  checkAndStartTour(hasGoals: boolean) {
    const cached = this.$tourCompleted();

    if (cached !== null) {
      if (!cached && hasGoals) this.startTour();
      return;
    }

    this.http
      .get<StandardResponse<boolean>>(`${this.baseUrl}/tour-status`)
      .subscribe({
        next: (response) => {
          this.$tourCompleted.set(response.data);
          if (!response.data && hasGoals) this.startTour();
        },
        error: () => {},
      });
  }

  startTour() {
    this.joyrideService
      .startTour({
        steps: ['editGoal', 'markHabit', 'toggleView'],
        themeColor: '#3f51b5',
        showPrevButton: true,
        stepDefaultPosition: 'top',
        customTexts: { done: 'Got it!', next: 'Next', prev: 'Back' },
      })
      .subscribe({
        complete: () => {
          this.$tourCompleted.set(true);
          this.http
            .patch<StandardResponse<boolean>>(`${this.baseUrl}/tour-complete`, {})
            .subscribe();
        },
      });
  }

  markTourCompleted(): Observable<StandardResponse<boolean>> {
    this.$tourCompleted.set(true);
    return this.http.patch<StandardResponse<boolean>>(`${this.baseUrl}/tour-complete`, {});
  }
}
