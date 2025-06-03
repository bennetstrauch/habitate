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

  sendTestEmail(email: string, username: string) {
    return this.#http.post<StandardResponse<string>>(
      environment.SERVER_URL + '/users/send-test-email',
      { email, username }
    );
  }

  sendResetLinkRequest(email: string) {
    return this.#http.post<StandardResponse<string>>(
      environment.SERVER_URL + '/users/reset-password',
      { email }
    );
  }

  setNewPassword(data: { token: string; newPassword: string }) {
    return this.#http.post(
      environment.SERVER_URL + '/users/set-new-password',
      data
    );
  }

  getUserDetails() {
    return this.#http.get<StandardResponse<User>>(
      environment.SERVER_URL + '/users/me'
    );
  }

  updateUser(user: Partial<User>) {
    return this.#http.patch<StandardResponse<string>>(
      environment.SERVER_URL + '/users/me/update',
      user
    );
  }
}
