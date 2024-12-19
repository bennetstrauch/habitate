import { Component, computed, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GoalsService } from './goals.service';

@Component({
  selector: 'app-update',
  imports: [MatCardModule, MatFormFieldModule, ReactiveFormsModule],
  template: `
    <mat-card>
      
       
      <mat-form-field>
        <mat-label>Goal</mat-label>
          <input matInput [formControl]="goalForm.controls.name" placeholder="your heartfelt goal" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Description</mat-label>
          <input matInput [formControl]="goalForm.controls.description" placeholder="Enter description" value="" />
      </mat-form-field>
        
      


    </mat-card>
  `,
  styles: ``
})
export class UpdateGoalComponent {
  #goalsService = inject(GoalsService);
  readonly id = input.required<string>()
  $goal = computed(
    () => this.#goalsService.$goals().filter(this.id)[0]
  )

  formBuilder = inject(FormBuilder);
  // @@ one for all in service?
  goalForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
    })
   

}
