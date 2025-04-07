import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@backend/users/users.types';
import { StandardResponse } from '@backend/types/standardResponse';
import { environment } from 'frontend/src/environments/environment';
import { LoginRequest } from '@backend/types/login/loginRequest';
import { LoginResponse } from '@backend/types/login/loginResponse';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  #http = inject(HttpClient);


  // __________ HTTP _________________________

  register(user: User) {
    return this.#http.post<StandardResponse<string>>(
      environment.SERVER_URL + '/users/register',
      user
    );
  }

  login(user: LoginRequest) {
    return this.#http.post<LoginResponse>(
      environment.SERVER_URL + '/users/login',
      user
    );
  }


  checkEmail(email: string) {
    return this.#http.get<StandardResponse<boolean>>(
      environment.SERVER_URL + '/users/check-email' + `?email=${email}`
    );
  }

  sendResetLinkRequest(email: string) {
    return this.#http.post<StandardResponse<string>>(
      environment.SERVER_URL + '/users/reset-password',
      { email }
    );
  }
}
