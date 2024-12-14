import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoalsService } from './goals.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-addGoal',
  imports: [ReactiveFormsModule],
  template: `

    <form [formGroup]="form" (ngSubmit)="addGoal()">

      <input placeholder="title" [formControl]="form.controls.title"/>
      <input placeholder="description" [formControl]="form.controls.description"/>
      <button [disabled]="form.invalid"> Add Goal </button>

    </form>
  `,
  styles: ``
})
export class AddGoalComponent {

  #goalsService = inject(GoalsService);

  #router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    'title': ['', Validators.required],
    'description': ['', Validators.required],
  });



  addGoal() {
    
  }

}
