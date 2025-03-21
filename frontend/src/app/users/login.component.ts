import { Component, inject } from '@angular/core';
import { ErrorWithStatus } from '@backend/utils/error.class';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { validators } from './register/register.component';
import { UsersService } from './users.service';
import { LoginRequest } from '@backend/types/login/loginRequest'
import { StateService } from '../state.service';
import { jwtDecode } from 'jwt-decode'
import { Token } from '@backend/types/token';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatButton],
  template: ` Login: 

    <form [formGroup]='form' (ngSubmit)='login()'>
     
      <input placeholder="email" [formControl]='form.controls.email'>
      <br>
      <input type="password" placeholder="password" [formControl]='form.controls.password'>
      <br>

      <button mat-button [disabled]="form.invalid"> Login </button>
    </form>
  `,
  styles: ``
})
export class LoginComponent {

  #usersService = inject(UsersService)
  #stateService = inject(StateService)
  #router = inject(Router)


  form = inject(FormBuilder).nonNullable.group({
    'email': ['', validators.email],
    'password': ['', validators.password]
  })


  login() {

    /// h## handle error correctly
  
    this.#usersService.login(this.form.value as LoginRequest)
    .pipe(
      catchError((err: ErrorWithStatus) => {

        if (err.status == 401) {
          alert(err?.error);
          console.log('catched error: ', err)
        } else {
          alert('An unknown error occurred');
        }

        return of(null); 
      })
    )
    .subscribe(response => {

      if (!response) return;
      console.log('login user:', response)

      const token = response.data.token
      const payloadDecoded = jwtDecode(token) as Token
      console.log(payloadDecoded)


      this.#stateService.$state.set({
        _id: payloadDecoded._id,
        name: payloadDecoded.name,
        email: payloadDecoded.email,
        jwtToken: token
      })

      this.#router.navigate(['', 'goals', 'overview'])
    })



  }
}
