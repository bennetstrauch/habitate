import { Component, inject } from '@angular/core';
import { DailyReflectionService } from '../daily-reflection.service';
import { getRandomPhrase } from '../../utils/utils';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-r-nostrain-intention',
  imports: [MatButton],
  template: `
    <div class="card">
      <br />
      {{ backToEasePhrase }}
      <br /> <br>
      <div [innerHTML]="simpleChangePhrase"></div>
      <br>
      <button
        mat-button
        (click)="dailyReflectionService.$currentStep.set('finalize')"
      >
        I've a brilliant idea !
      </button>
    </div>
  `,
  styles: ``,
})
export class RNostrainIntentionComponent {
  dailyReflectionService = inject(DailyReflectionService);


  goodNouns = [
    'ease',
    'joy',
    'softness',
    'smoothness',
    'sweetness',
    'lightness',
    'playfulness',
    'fun',
    'enjoyment',
    'freedom',
    'light-heartedness',
  ];

  struggleNouns = [
    'strain',
    'pressure',
    'stress',
    'tension',
    'friction',
    'heat',
    'struggle',
  ];

  backToGoodAdjectives = [
    'easy',
    'joyful',
    'soft',
    'smooth',
    'sweet',
    'light',
    'playful',
    'fun',
    'enjoyable',
    // "flowing",
    // "free",
    'light-hearted',
  ];

  goodTransitionAdjective = [
    'easier',
    'softer',
    'more gentle',
    'more joyful',
    'smoother',
    'sweeter',
    'lighter',
    'more playful',
    'more fun',
    'more enjoyable',
    // "more flowing",
    // "more free",
    'more light-hearted',
  ];

  goodNoun = getRandomPhrase(this.goodNouns);

  backToEasePhrases = [
    `Let's bring it back to ${this.goodNoun}.`,
    `Let us transform the ${getRandomPhrase(this.struggleNouns)} into ##.`,
    `Let's make it ${getRandomPhrase(this.backToGoodAdjectives)} again.`,
    `Let's make it a little ${getRandomPhrase(this.goodTransitionAdjective)}.`,
    `Let's make it ${getRandomPhrase(this.goodTransitionAdjective)}.`,
    `Let us roll with ${this.goodNoun} again.`,
    `Let us flow with ${this.goodNoun} again.`,
    `Let's take out the ${getRandomPhrase(this.struggleNouns)}.`,
    `Let us replace the ${getRandomPhrase(this.struggleNouns)} with ${this.goodNoun}.`,
  ];

  backToEasePhrase = getRandomPhrase(this.backToEasePhrases);

  noStrain = [
    `Let's make it a little more easy.`,
    `Let's take out the strain.`,
    `Let's replace the strain with ease.`,
    `Let's bring in a little more softness.`,
    `Let's make it a little more gentle.`,
    `Let's make it enjoyable again.`,
    `Let's make it a little more fun.`,
    `Let's make it a little more light-hearted.`,
    `Let's make it a little more playful.`,
    `Let's make it fun again.`,
    `Let's make it a little more joyful.`,
    'Let us transfrom the strain into ease.',
    'Let us transform the strain into joy.',
    'Let us roll it with ease again.',
    `Let's bring it back to ease.`,
    `Let's bring it back the sweetness.`,
    `Let's bring back the joy.`,
    "Let's bring back the smoothness.",
    "Let's transform the friction into joy.",
    "Let's take out the friction.",
    "Let's take out the heat.",
    "Let's take out the pressure.",
    "Let's take out the stress.",
    "Let's take out the tension.",
    "Let's take out the struggle.",
    "Let's transform the heat into softness.",
  ];

  goodNounsForTomorrow = this.goodNouns.filter( noun => noun !== this.goodNoun);
  goodNounForTomorrow = getRandomPhrase(this.goodNounsForTomorrow);


  smallAdjectives = [
    'small',
    'little',
    'gentle',
    'soft',
    'easy',
    'sublte'
  ];

  changeWords = [
    'change', 'adjustment', 'switch', 'fine-tunement', 'shift', 'modification'
  ]
  // ### edit more options and add same to incompleted-habit-intention later on
  simpleChangePhrase = [
    `What <strong>${getRandomPhrase(this.smallAdjectives)} ${getRandomPhrase(this.changeWords)}</strong> to make it happen with ${this.goodNounForTomorrow} tomorrow?`,
  ];
}
