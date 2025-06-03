import { Component, inject } from '@angular/core';
import { ReflectionsService } from '../reflections.service';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import confetti from 'canvas-confetti';
import { getRandomElement, getRandomPhrase } from '../../utils/utils';
import { StateService } from '../../state.service';

@Component({
  selector: 'app-r-final-thankyou',
  imports: [MatButton],
  template: `
    <div class="flex-column">
      <div class="card">
        <p style="font-style: italic;">
          {{ encouragement }}
        </p>
        <p>
          <strong>Thank you</strong> <br />
          for taking the time to take care of yourSelf. <br />
        </p>

        @if(stateService.$state().name === 'Antwan') {
          <p> PS: Special Message to Antwan: <br> You are loved and appreciated.</p>
  }
        <div>
          <button mat-button (click)="completeReflection()">
            Finish Reflection
          </button>
        </div>
      </div>

      <div class="smiley">
        {{ smiley }}
      </div>
      <br />
    </div>
  `,
  styles: `
   .smiley {
      font-size: 4rem;
    }
    `,
})
export class RFinalThankyouComponent {

  #router = inject(Router);
  reflectionsService = inject(ReflectionsService);
  stateService = inject(StateService);

  

  encouragements = [
    'Every step counts - and you just took one.',
    'You showed up my friend :)',
    'A soft flow of attention in the right direction.',
    'Effortless Consistency results in life lived consistently effortless.',
    'Smooth progress is most sustainable.',
    'Effortless Consistency will really move things for you.',
    'Being, self-reflective, will achieve intentions.',
    'Being, self-reflective, will achieve its intentions.',
    'Curving back upon my own Nature, I create again and again.',
    'Pure reflection leads to break-throughs.',
    'May your valuable goals be achieved so naturally.',
    'The core of you is more valuable than anything.',

  ];

  encouragement = getRandomPhrase(this.encouragements);

  smileys = [
    '😄',
    '😁',
    '😊',
    '😎',
    '🤗',
    '🥳',
    '😇',
    '😃',
    '😸',
    '😺',
    '🤩',
    '😹',
    '🙌',
    '🫶',
    '💖',
    '🌟',
    '🎉',
    '💫',
    '✨',
    '🎊',
    '😻',
    '🤠',
    '😽',
    '😌',
  ];

  smiley = getRandomElement(this.smileys);

  ngOnInit() {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  completeReflection() {
    if (this.reflectionsService.$reflection()) {
      this.reflectionsService.$reflection()!.completed = true;

      this.reflectionsService
        .put_reflection(this.reflectionsService.$reflection()!)
        .subscribe((response) => {
          if (response.success) {
            console.log('Reflection updated: ', response.data);
          }

          this.#router.navigate(['', 'goals', 'overview']);
          this.reflectionsService.loadReflectionStats();
        });
    }
  }
}
