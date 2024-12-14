import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { validators } from './register/register.component';
import { UsersService } from './users.service';
import { LoginRequest } from '@backend/types/login/loginRequest'
import { StateService } from '../state.service';
import { jwtDecode } from 'jwt-decode'
import { Token } from '@backend/types/token';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatButton],
  template: ` Login: 

    <form [formGroup]='form' (ngSubmit)='login()'>
     
      <input placeholder="email" [formControl]='form.controls.email'>
      <br>
      <input placeholder="password" [formControl]='form.controls.password'>
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

    this.#usersService.login(this.form.value as LoginRequest).subscribe(response => {
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

      this.#router.navigate(['', 'goals'])
    })

  }
}
