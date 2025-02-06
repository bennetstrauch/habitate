import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StandardResponse } from '@backend/types/standardResponse';

@Injectable({
  providedIn: 'root'
})
export class HabitsService {

  #router = inject(Router);
  #http = inject(HttpClient);
  
    toggle_Completed(goal: Goal) {
      return this.#http.put<StandardResponse<number>>(environment.SERVER_URL + '/goals' + '/' + goal._id, goal);
    }
  
}
