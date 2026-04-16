import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanDeactivate {
  canDeactivate: () => Observable<boolean> | boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanDeactivate> =
  (component) => component.canDeactivate();
