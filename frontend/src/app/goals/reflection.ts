import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterLink } from '@angular/router';
import { GoalsService } from './goals.service';
import { ProgressService } from '../progresses/progresses.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { formatDateToDisplayAsWeekMonthDay } from '../utils/utils';

@Component({
    selector: 'app-reflection',
    imports: [MatStepperModule, MatButtonModule, MatCheckboxModule, RouterLink],
    template: `
    <mat-stepper class="card" linear #stepper >

    <mat-step>


    <!-- implement as head component. -->
    <p>
        <strong>{{$formattedDate()}} - Reflection </strong><br>
        ___________________________<br>
        <br>

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

        <strong>{{habit.name}}</strong> <br>
        <br>
        @if (habit.latestProgress.completed) {
            Congratulations! <br>

            Did it feel good?  <br>
        } @else {
            No worries. <br>
            Just tune in. <br>
            <br>
            What did hold you back from doing it? <br>
            & <br>
            <strong>What simple change</strong> to make it happen with ease tomorrow? <br>
            <br>
        }

        
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

    progressService = inject(ProgressService);

      
    $formattedDate = signal<string>('');

    constructor(private route: ActivatedRoute) {}
  
    ngOnInit() {
      // triggers when route parameters changes
      this.route.paramMap.subscribe(params => {
        const dateString = params.get('date'); // Get ':date' parameter
  
        if (dateString) {
          const dateObj = new Date(dateString); // Convert string to Date object
          this.$formattedDate.set(dateObj.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })); // Format date
        }
      });
    }
  

}
