import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterLink } from '@angular/router';
import { GoalsService } from './goals.service';

@Component({
    selector: 'app-reflection',
    imports: [MatStepperModule, MatButtonModule, MatCheckboxModule, RouterLink],
    template: `
    <mat-stepper class="card" linear #stepper >

    <mat-step>

    <p>
        Hello my friend. <br>
        I am Happy to reflect with you today. <br>
    </p>

    <button mat-button matStepperNext>
            Next
    </button>
    </mat-step>

    <mat-step>
    <p>
        Take a minute to settle down. <br>
    </p>

    <button mat-button matStepperNext>
            Next
    </button>
    </mat-step>


    @for(goal of this.goalsService.$goals(); track $index) {

     <mat-step>
        <p>Intention</p> 
        <strong>" {{goal.name}} "</strong>
        <br> <br>

        <button mat-button matStepperNext>
                Check Habits
            </button>
     </mat-step>


     @for(habit of goal.habits; track $index) {

        <mat-step>

        <mat-checkbox [checked]="">{{habit.name}}</mat-checkbox>
            <div>
            <button mat-button matStepperNext>
                Next
            </button>
            </div>
        </mat-step>
     }
        
    }

    <mat-step>
        <p>
        <strong>Thank you</strong> <br> 
        for taking the time to take care of yourself. <br>
        </p>
        <div>
        <button mat-button matStepperPrevious>Back</button>
        <button mat-button [routerLink]="['', 'goals', 'overview']">
            Finish Reflection
        </button>
        </div>
    </mat-step>

  
</mat-stepper>
  `,
    styles: ``
})
export class ReflectionComponent {

    #router = inject(Router);
    goalsService = inject(GoalsService);




}
