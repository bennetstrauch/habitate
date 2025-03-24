import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterLink } from '@angular/router';
import { GoalsService } from '../goals/goals.service';
import { ProgressService } from '../progresses/progresses.service';
import { ActivatedRoute } from '@angular/router';
import { ReflectionsService } from './reflections.service';
import { Reflection } from '@backend/reflections/reflections.types';
import { getRandomPhrase } from '../utils/utils';
import { StateService } from '../state.service';

@Component({
  selector: 'app-reflection',
  imports: [MatStepperModule, MatButtonModule, MatCheckboxModule],
  template: `
    <mat-stepper class="card" linear #stepper>
      <mat-step>
        <!-- implement as head component. -->
        <p>
          <strong>{{ $formattedDate() }} - Reflection </strong><br />
          ___________________________<br />
          <br />

          {{ greeting }} <br />

          {{ myAttitude }} reflect with you today. <br />
        </p>

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      <mat-step>
        <p>Let's take a minute to settle down. <br /></p>

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      <mat-step>
        <p>
          What was <strong>something {{ reflectiveWord }}</strong> today? <br />
        </p>

        <p>Just <strong>relax and see</strong> what bubbles up in your mind</p>

        <!-- #let user enter -->

        <button mat-button matStepperNext>Next</button>
      </mat-step>

      @for(goal of this.goalsService.$goals(); track $index) {
      <!-- #doesnt gt triggered -->
      @if ($index === 0) {
      <p><strong>Let's flow</strong> through your precious goals :)</p>
      }
      <mat-step>
        <p>Intention</p>
        <strong>" {{ goal.name }} "</strong>
        <br />
        <br />

        <button mat-button matStepperNext>Check Habits</button>
      </mat-step>

      @for(habit of goal.habits; track $index) {
      <!--  -->
      @if (habit.latestProgress.completed) {
      <mat-step>
        <strong>{{ habit.name }}</strong> <br />
        <br />

        {{ getHabitCongratulation(habit._id) }}<br />
        {{ getHabitQuestion(habit._id) }}
        <br />
        <br />
        <button mat-button matStepperNext>Next</button>
      </mat-step>
      } @else {
      <!--  -->
      <!-- If Incompleted Habit is the Selected on to reflect on: -->
      @if (habit._id == randomIncompleteHabitId()){
      <mat-step>
        <strong>{{ habit.name }}</strong> <br />
        ----------------
        <br />
        <!-- #alternate -->
        No worries. <br /> 
         <!--No judgement,   -->
        Just tune in. <br />
        <!-- Just feel in, Just relax and feel, Just settle in,  -->
        <br />
        <strong>What simple change</strong> to make it happen with ease
        tomorrow?
        <!-- What did hold you back from doing it?, 
         Is there a soft adjustment you could make to allow this habit to be integrated tomorrow?,

 -->
        <br />
        <button mat-button matStepperNext>Next</button>
      </mat-step>

      } }
      <br />
      <br />
      } }

      <!-- @if(randomIncompleteHabitId()===null){
      <mat-step>
        There is so much love inside to be revealed.

        ##individualize 
              
        When you close your eyes innocently,
        non-required-to-do-anything,
        is there an intention that comes up for tomorrow?
        <button mat-button matStepperNext>Next</button>
      </mat-step>

    } -->

      <mat-step>
        <p>
          <strong>Thank you</strong> <br />
          for taking the time to take care of yourSelf. <br />
        </p>
        <div>
          <button mat-button matStepperPrevious>Back</button>

          <button mat-button (click)="completeReflection()">
            Finish Reflection
          </button>
        </div>
      </mat-step>
    </mat-stepper>
  `,
  styles: `
    
    ::ng-deep .mat-horizontal-stepper-header-container {
        display: none !important;
        // removes icons from stepper
    }
`,
})
export class ReflectionComponent {
  readonly #router = inject(Router);
  readonly goalsService = inject(GoalsService);
  readonly reflectionsService = inject(ReflectionsService);
  readonly progressService = inject(ProgressService);
  readonly stateService = inject(StateService);

  $formattedDate = signal<string>('');

  habits = this.goalsService.$goals().flatMap((goal) => goal.habits);
  habitsMappedToQuestions: Map<string, string> = new Map();
  habitsMappedToCongratulations: Map<string, string> = new Map();

  randomIncompleteHabitId = computed(() => this.getRandomIncompleteHabit());

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.setFormattedDateToDisplay();
    this.assignPhrasesToCompletedHabits();
  }

  completeReflection() {
    if (this.reflectionsService.$reflection()) {
      this.reflectionsService.$reflection()!.completed = true;

      this.reflectionsService
        .put_reflection(this.reflectionsService.$reflection()!)
        .subscribe((response) => {
          if (response.success) {
            console.log('Reflection updated: ', response.data);
          }
          this.#router.navigate(['', 'goals', 'overview']);
        });
    }
  }

  setFormattedDateToDisplay() {
    this.route.paramMap.subscribe((params) => {
      const dateString = params.get('date'); // Get ':date' parameter

      if (dateString) {
        const dateObj = new Date(dateString); // Convert string to Date object
        this.$formattedDate.set(
          dateObj.toLocaleDateString('en-CA', {
            weekday: 'short', // e.g., "Mon"
            month: 'short', // e.g., "Feb"
            day: 'numeric', // e.g., "16"
            timeZone: 'UTC', // Use UTC to avoid timezone conversion
          })
        );
      }
    });
  }

  assignPhrasesToCompletedHabits() {
    const completedHabits = this.habits
      .filter((habit) => habit.latestProgress.completed)
      .flatMap((habit) => habit._id);

    this.habitsMappedToQuestions.clear();

    completedHabits.forEach((habitId) => {
      const randomIndexQuestions = Math.floor(
        Math.random() * this.completedQuestions.length
      );

      // #getrandomindexinutils

      const randomIndexCongratulations = Math.floor(
        Math.random() * this.congratulations.length
      );

      this.habitsMappedToQuestions.set(
        habitId,
        this.completedQuestions[randomIndexQuestions]
      );
      this.habitsMappedToCongratulations.set(
        habitId,
        this.congratulations[randomIndexCongratulations]
      );
    });
  }

  getHabitQuestion(habitId: string): string {
    return this.habitsMappedToQuestions.get(habitId) || 'Did it uplift you?';
  }

  getHabitCongratulation(habitId: string): string {
    return (
      this.habitsMappedToCongratulations.get(habitId) || 'Fulfilled prophecy ;)'
    );
  }

  getRandomIncompleteHabit() {
    const incompleteHabitIds = this.habits
      .filter((habit) => !habit.latestProgress.completed)
      .flatMap((habit) => habit._id);

    if (incompleteHabitIds.length === 0) {
      return null;
    }

    const randomHabitId =
      incompleteHabitIds[Math.floor(Math.random() * incompleteHabitIds.length)];
    return randomHabitId;
  }


  getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) return 'morning'

    if (hour < 18) return 'afternoon'

    return 'evening'
    }
 

  greeting = getRandomPhrase([
    'Hello',
    'Welcome ',
    'Good' + this.getGreeting(),
    'Good to see you',

  ]);
  
  


  salutation = getRandomPhrase([
    'my friend', 'dear' + this.stateService.$state().name + '.', 'beautiful soul', 
  ])

  welcomePhrase = this.greeting + this.salutation

  reflectiveWord = getRandomPhrase([
    'good',
    'joyful',
    'sweet',
    'charming',
    'beautiful',
    'insightful',
  ]);

  myAttitude = getRandomPhrase([
    'I am happy to',
    'It is my joy to',
    "It's so cool I get to",
    'What a delight to',
  ]);

  congratulations = [
    'Congratulations!',
    'You did it!',
    'Status: Completed!',
    'Da daa da done!',
  ];

  completedQuestions = [
    'Did it feel good?',
    'Did it lift you up?',
    'Did you feel more balanced after?',
    'Did it bring you joy?',
    'Did you feel more centered after?',
    'Did you feel energized after?',
  ];


}
