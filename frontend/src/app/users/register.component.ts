import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { validationRules } from '@global/auth/validationRules'
import { UsersService } from './users.service';
import { User } from '@backend/users/users.model'
import { Router } from '@angular/router';



@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  template: `

    <form [formGroup]='form' (ngSubmit)='register()'>

      <input placeholder="username" [formControl]='form.controls.username'>
      <br>
      <input placeholder="email" [formControl]='form.controls.email'>
      <br>
      <input placeholder="password" [formControl]='form.controls.password'>
      <br>

      <button [disabled]="form.invalid"> Register </button>
    </form>
  `,
  styles: ``
})
export class RegisterComponent {

  #usersService = inject(UsersService)
  #router = inject(Router)
  

  form = inject(FormBuilder).nonNullable.group({
    'username': ['', validators.username],
    'email': ['', validators.email],
    'password': ['', validators.password]
  })


  register(){

    this.#usersService.register(this.form.value as User).subscribe(response => {
      console.log(response)
      this.#router.navigate(['', 'login'])
    })
  }

}

//# one variable for each form property. or create type reigisterrequest and iterate over keyset
export const formProperties = ['username', 'email', 'password']

export const validators = {
  username: [ 
    Validators.required, 
    Validators.minLength(validationRules.username.minLength), 
    Validators.maxLength(validationRules.username.maxLength)
  ],

  email: [
    Validators.required, 
    Validators.email
  ],

  password: [
    Validators.required, 
    Validators.minLength(validationRules.password.minLength), 
    Validators.maxLength(validationRules.password.maxLength)
  ]

}