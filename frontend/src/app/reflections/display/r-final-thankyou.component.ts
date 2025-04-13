import { Component, inject } from '@angular/core';
import { ReflectionsService } from '../reflections.service';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-r-final-thankyou',
  imports: [MatButton],
  template: `
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
  `,
  styles: ``,
})
export class RFinalThankyouComponent {
  #router = inject(Router);
  reflectionsService = inject(ReflectionsService);

  ngOnInit() {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      // colors: ['#bb0000', '#ffffff', '#00bb00', '#0000bb'],
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
