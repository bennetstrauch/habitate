import { Component, inject } from '@angular/core';
import { ReflectionsService } from '../reflections.service';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import confetti from 'canvas-confetti';
import { getRandomElement } from '../../utils/utils';

@Component({
  selector: 'app-r-final-thankyou',
  imports: [MatButton],
  template: `
    <div class="flex-column">
      <div class="card">
        <p>
          <strong>Thank you</strong> <br />
          for taking the time to take care of yourSelf. <br />
        </p>
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
        });
    }
  }
}
