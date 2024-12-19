import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Goal } from '@backend/goals/goals.model';
import { GoalsService } from '../goals.service';

@Injectable({
  providedIn: 'root'
})
export class GoalsResolver implements Resolve<Goal[]> {
  constructor(private goalsService: GoalsService) {}


  //@@ good to set goals here in the service and then access from service?, instead from route.snapshot.data
  resolve(): Observable<Goal[]> {

    return this.goalsService.get_goals().pipe(
      map(response => {
        if (response.success) {
          this.goalsService.$goals.set(response.data);
          return response.data;
        }

        return [];
      })
    );
  }
}