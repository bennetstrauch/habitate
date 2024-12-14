import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { validationRules } from '@global/auth/validationRules'
import { UsersService } from '../users.service';
import { User } from '@backend/users/users.model'
import { Router } from '@angular/router';



@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],

  template: `

    <div>
      To be able to connect with us, please Register:
    </div>

    <form [formGroup]='form' (ngSubmit)='continue()'>

    
      <input mat-input placeholder="name" [formControl]='form.controls.name'>
      <br>
      <input placeholder="email" [formControl]='form.controls.email'>
      <br>
      <input placeholder="password" [formControl]='form.controls.password'>
      <br>

      <button [disabled]="form.invalid"> Continue </button>
    </form>
  `,
  styles: ``
})
export class Part1 {

  #usersService = inject(UsersService)
  #router = inject(Router)
  

  form = inject(FormBuilder).nonNullable.group({
    'name': ['', validators.name],
    'email': ['', validators.email],
    'password': ['', validators.password]
  })


  continue(){

    this.#usersService.register(this.form.value as User).subscribe(response => {
      console.log(response)
      this.#router.navigate(['', 'login'])
    })
  }

}

//# one variable for each form property. or create type reigisterrequest and iterate over keyset
export const formProperties = ['name', 'email', 'password']

export const validators = {
  name: [ 
    Validators.required, 
    Validators.minLength(validationRules.name.minLength), 
    Validators.maxLength(validationRules.name.maxLength)
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