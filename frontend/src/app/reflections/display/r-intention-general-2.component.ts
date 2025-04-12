import { Component } from '@angular/core';
import { getRandomPhrase } from '../../utils/utils';

@Component({
  selector: 'app-r-intention-general-2',
  imports: [],
  template: ` <p>r-intention-general-2 works!</p> `,
  styles: ``,
})
export class RIntentionGeneral2Component {
  manifests = [
    'bubbles up',
    'comes up',
    'arises',
    'appears',
    'shows up',
    'manifests',
    'rises out of the Silcence',
  ];

  noResistance = [
    '<br>- just by Being as simple as possible-<br>',
    '',
    '<br>- without pressure to do anything - <br>',
  ];

  intentionInstruction = `Now, close your eyes again, and see ${getRandomPhrase(
    this.noResistance
  )} whether an intention for tomorrow ${getRandomPhrase(this.manifests)}`;

  alternative =
    'No resistance, no effort, no strain, <br>just a simple intention that comes up by itself.';
}
