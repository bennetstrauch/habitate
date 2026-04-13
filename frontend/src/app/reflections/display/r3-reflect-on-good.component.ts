import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { getRandomPhrase } from '../../utils/utils';
import { DailyReflectionService } from '../daily-reflection.service';

@Component({
  selector: 'app-r3-reflect-on-good',
  imports: [MatButton],
  template: `
    <div class="card">
      <p>
        What was <strong>something {{ reflectiveWord }}</strong> today?
      </p>
      <p>Just <strong>relax and see</strong> what bubbles up in your mind</p>

      <div class="word-icon">
        @switch (reflectiveWord) {
          @case ('good') {
            <svg viewBox="0 0 80 80" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
              <path d="M40,74 Q14,52 18,26 Q40,6 62,26 Q66,52 40,74 Z" fill="#66bb6a"/>
              <path d="M40,74 Q40,46 40,18" stroke="#2e7d32" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <path d="M40,60 Q28,50 24,40" stroke="#2e7d32" stroke-width="1.8" fill="none" stroke-linecap="round"/>
              <path d="M40,50 Q52,40 56,30" stroke="#2e7d32" stroke-width="1.8" fill="none" stroke-linecap="round"/>
              <path d="M40,40 Q30,33 27,24" stroke="#2e7d32" stroke-width="1.8" fill="none" stroke-linecap="round"/>
            </svg>
          }
          @case ('joyful') {
            <svg viewBox="0 0 80 80" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="40" cy="18" rx="6" ry="12" fill="#ffd600"/>
              <ellipse cx="40" cy="62" rx="6" ry="12" fill="#ffd600"/>
              <ellipse cx="18" cy="40" rx="12" ry="6" fill="#ffd600"/>
              <ellipse cx="62" cy="40" rx="12" ry="6" fill="#ffd600"/>
              <ellipse cx="25" cy="25" rx="6" ry="12" fill="#ffd600" transform="rotate(-45 25 25)"/>
              <ellipse cx="55" cy="25" rx="6" ry="12" fill="#ffd600" transform="rotate(45 55 25)"/>
              <ellipse cx="25" cy="55" rx="6" ry="12" fill="#ffd600" transform="rotate(45 25 55)"/>
              <ellipse cx="55" cy="55" rx="6" ry="12" fill="#ffd600" transform="rotate(-45 55 55)"/>
              <circle cx="40" cy="40" r="14" fill="#6d4c41"/>
              <circle cx="35" cy="36" r="2.5" fill="#8d6e63"/>
              <circle cx="42" cy="34" r="2.5" fill="#8d6e63"/>
              <circle cx="47" cy="39" r="2.5" fill="#8d6e63"/>
              <circle cx="44" cy="46" r="2.5" fill="#8d6e63"/>
              <circle cx="36" cy="46" r="2.5" fill="#8d6e63"/>
            </svg>
          }
          @case ('sweet') {
            <svg viewBox="0 0 80 80" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="40" cy="52" rx="24" ry="24" fill="#f9a825"/>
              <rect x="30" y="28" width="20" height="14" rx="4" fill="#f9a825"/>
              <rect x="27" y="22" width="26" height="10" rx="5" fill="#ffd54f"/>
              <ellipse cx="33" cy="50" rx="5" ry="9" fill="#ffd54f" opacity="0.4"/>
              <path d="M40,76 Q34,82 40,86 Q46,82 40,76" fill="#f9a825"/>
              <path d="M52,40 Q62,36 68,28" stroke="#f57f17" stroke-width="2" fill="none" stroke-linecap="round"/>
              <circle cx="70" cy="26" r="4" fill="#f57f17" opacity="0.6"/>
            </svg>
          }
          @case ('charming') {
            <svg viewBox="0 0 80 80" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="22" r="11" fill="#f48fb1"/>
              <circle cx="58" cy="40" r="11" fill="#f06292"/>
              <circle cx="40" cy="58" r="11" fill="#f48fb1"/>
              <circle cx="22" cy="40" r="11" fill="#f06292"/>
              <circle cx="55" cy="25" r="10" fill="#ec407a" opacity="0.72"/>
              <circle cx="40" cy="40" r="8" fill="white"/>
              <circle cx="40" cy="40" r="3.5" fill="#f9a825"/>
            </svg>
          }
          @case ('beautiful') {
            <svg viewBox="0 0 80 80" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
              <path d="M40,8 L43,33 L68,36 L43,39 L40,64 L37,39 L12,36 L37,33 Z" fill="#ffd700"/>
              <path d="M18,16 L19.5,26 L30,27.5 L19.5,29 L18,39 L16.5,29 L6,27.5 L16.5,26 Z" fill="#ffd700" opacity="0.7"/>
              <path d="M64,48 L65,55 L72,56 L65,57 L64,64 L63,57 L56,56 L63,55 Z" fill="#ffd700" opacity="0.65"/>
            </svg>
          }
          @case ('insightful') {
            <svg viewBox="0 0 80 80" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="32" r="20" fill="#ffd600"/>
              <path d="M30,50 Q30,60 40,60 Q50,60 50,50" fill="#ffd600"/>
              <rect x="32" y="58" width="16" height="4" rx="2" fill="#bdbdbd"/>
              <rect x="34" y="64" width="12" height="4" rx="2" fill="#bdbdbd"/>
              <rect x="36" y="70" width="8" height="4" rx="2" fill="#9e9e9e"/>
              <line x1="40" y1="6" x2="40" y2="2" stroke="#ffd600" stroke-width="3" stroke-linecap="round"/>
              <line x1="62" y1="14" x2="65" y2="11" stroke="#ffd600" stroke-width="3" stroke-linecap="round"/>
              <line x1="70" y1="32" x2="74" y2="32" stroke="#ffd600" stroke-width="3" stroke-linecap="round"/>
              <line x1="18" y1="14" x2="15" y2="11" stroke="#ffd600" stroke-width="3" stroke-linecap="round"/>
              <line x1="10" y1="32" x2="6" y2="32" stroke="#ffd600" stroke-width="3" stroke-linecap="round"/>
            </svg>
          }
        }
      </div>

      <button mat-button (click)="handleNextStep()">Next</button>
    </div>
  `,
  styles: [`
    .word-icon {
      margin: 8px 0 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.85;
    }
  `],
})
export class R3ReflectOnGoodComponent {
  readonly dailyReflectionService = inject(DailyReflectionService);

  reflectiveWord = getRandomPhrase(['good', 'joyful', 'sweet', 'charming', 'beautiful', 'insightful']);

  handleNextStep() {
    if (this.dailyReflectionService.stepComponentMap.has('goal-1')) {
      this.dailyReflectionService.$currentStep.set('goal-1');
    } else {
      this.dailyReflectionService.$currentStep.set('no-resistance');
    }
  }
}
