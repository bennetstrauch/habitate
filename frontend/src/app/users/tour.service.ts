import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'frontend/src/environments/environment';
import { JoyrideService } from 'ngx-joyride';
import { StandardResponse } from '@backend/types/standardResponse';

export interface TourStatusResponse {
  tourCompleted: boolean;
}

export interface TourCompleteResponse {
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private joyrideService = inject(JoyrideService);
  private http = inject(HttpClient);
  private baseUrl = environment.SERVER_URL + '/users';

  constructor() {}



  startTour() {
    this.joyrideService
      .startTour({
        steps: ['editGoal', 'markHabit', 'toggleView'], // Define tour steps
        themeColor: '#3f51b5', // Match Material design theme
        showPrevButton: true, // Allow navigating backward
        stepDefaultPosition: 'top', // Default popup position
        customTexts: {
          done: 'Got it!', // Customize button text
          next: 'Next',
          prev: 'Back',
        },
      })
      .subscribe({
        complete: () => {
          // Mark tour as completed on backend
          this.markTourCompleted().subscribe({
            next: () => console.log('Tour marked as completed'),
            error: (err) => console.error('Failed to mark tour as completed:', err),
          });
        },
        error: (err) => console.error('Tour error:', err),
      });
  }







  // __________ HTTP _________________________
  /**
   * Checks if the user has completed the tour.
   * @returns Observable emitting the tour status.
   */
  checkTourStatus(): Observable<StandardResponse<boolean>> {
    return this.http.get<StandardResponse<boolean>>(`${this.baseUrl}/tour-status`);
  }

  /**
   * Marks the tour as completed for the user.
   * @returns Observable emitting the completion response.
   */
  markTourCompleted(): Observable<StandardResponse<boolean>> {
    return this.http.patch<StandardResponse<boolean>>(`${this.baseUrl}/tour-complete`, {});
  }
}