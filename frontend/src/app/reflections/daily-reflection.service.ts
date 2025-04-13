import { computed, inject, Injectable, signal } from '@angular/core';
import { Goal, Habit } from '@backend/goals/goals.types';
import { GoalsService } from '../goals/goals.service';
import { getRandomElement } from '../utils/utils';
import { R1WelcomeComponent } from './display/r1-welcome.component';
import { R2SettleDownComponent } from './display/r2-settle-down.component';
import { R3ReflectOnGoodComponent } from './display/r3-reflect-on-good.component';
import { RGoalComponent } from './display/r-goal.component';
import { RHabitCompletedComponent } from './display/r-habit-completed.component';
import { RHabitIncompleteComponent } from './display/r-habit-incomplete.component';
import { RFinalThankyouComponent } from './display/r-final-thankyou.component';
import { RIntentionGeneralComponent } from './display/r-intention-general.component';
import { RIntentionGeneral2Component } from './display/r-intention-general-2.component';

@Injectable({
  providedIn: 'root',
})
export class DailyReflectionService {
  readonly goalsService = inject(GoalsService);
  $currentStep = signal('start');

  // compute habits, and add to map with key same as currentStepIdentifiert (goal-1, etc.)

  incompleteHabit: HabitWithGoal | null = null;

  selectedHabitsWithGoal: { goalId: Goal; habits: Habit[] }[] = [];
  // selectedHabitsWithGoal: HabitWithGoal[] = [];
  selectedHabitsForGoal: Map<string, Habit[]> = new Map();

  stepsMappedToHabitOrGoal = new Map<string, any>();

  // ## make exported variables for strings
  stepComponentMap = new Map<string, any>([
    ['start', R1WelcomeComponent],
    ['settle-down', R2SettleDownComponent],
    ['reflect-on-good', R3ReflectOnGoodComponent],
    ['finalize', RFinalThankyouComponent],
    ['intention-no-goals', RIntentionGeneralComponent],
    ['intention-no-goals-2', RIntentionGeneral2Component],
  ]);

  constructor() {}

  initDailyReflection() {
    this.selectedHabitsWithGoal = [];
    this.selectedHabitsForGoal.clear();

    this.incompleteHabit = this.getRandomIncompleteDailyHabit();
    console.log('incompleteHabit', this.incompleteHabit);

    let goalIndex = 0;
    let habitIndex = 0;

    const completedHabits = this.getRandomCompletedHabitsWithGoal();

    let habits = [...completedHabits];
    console.log('habits to reflect on: ', habits);

    if (this.incompleteHabit) {
      habits.push(this.incompleteHabit!);
      // shuffle:
      habits.sort(() => Math.random() - 0.5);
    }

    console.log('habits to reflect on', habits);

    habits.forEach((habitWithGoal) => {
      const goal = habitWithGoal.goal;
      const goalId = goal._id;
      const habit = habitWithGoal.habit;

      if (!this.selectedHabitsForGoal.has(goalId)) {
        goalIndex++;
        habitIndex = 0;
        this.stepsMappedToHabitOrGoal.set('goal-' + goalIndex, goal);
        this.stepComponentMap.set('goal-' + goalIndex, RGoalComponent);
        this.selectedHabitsForGoal.set(goalId, []);
      }

      this.selectedHabitsForGoal.get(goalId)?.push(habit);
      habitIndex++;
      this.stepsMappedToHabitOrGoal.set(
        'goal-' + goalIndex + '-habit-' + habitIndex,
        habit
      );
      if (habit.latestProgress.completed) {
        this.stepComponentMap.set(
          'goal-' + goalIndex + '-habit-' + habitIndex,
          RHabitCompletedComponent
        );
      } else {
        this.stepComponentMap.set(
          'goal-' + goalIndex + '-habit-' + habitIndex,
          RHabitIncompleteComponent
        );
      }
    });

    console.log('stepMap', this.stepComponentMap);
    console.log('steps', this.stepsMappedToHabitOrGoal);
    console.log('selectedHabitsForGoal', this.selectedHabitsForGoal);
  }

  handleNextHabitOrGoal() {
    let currentStep = this.$currentStep();

    let currentStepSplit = currentStep.split('-');

    let habitIndex = Number(currentStepSplit[3]) + 1;
    currentStepSplit[3] = habitIndex.toString();

    let nextHabit = currentStepSplit.join('-');

    if (this.stepsMappedToHabitOrGoal.get(nextHabit)) {
      this.$currentStep.set(nextHabit);
    } else {
      let goalIndex = Number(currentStepSplit[1]);
      let nextGoal = currentStepSplit[0] + '-' + (goalIndex + 1);
      if (this.stepsMappedToHabitOrGoal.get(nextGoal)) {
        this.$currentStep.set(nextGoal);
      } else {
        this.$currentStep.set('finalize');
      }
    }
  }

  getHabitsWithGoal = () =>
    this.goalsService
      .$goals()
      .flatMap((goal) => goal.habits.map((habit) => ({ goal: goal, habit })));

  // make it on init and check if changes when goals change ##
  $habitsWithGoal = computed(() => this.getHabitsWithGoal());

  getRandomIncompleteDailyHabit() {
    const incompleteHabits = this.$habitsWithGoal().filter(
      (habitWithGoal) =>
        habitWithGoal.habit.frequency == 7 &&
        !habitWithGoal.habit.latestProgress.completed
    );

    if (incompleteHabits.length === 0) {
      return null;
    }

    const randomHabitWithGoal =
      getRandomElement<HabitWithGoal>(incompleteHabits);

    return randomHabitWithGoal;
  }

  getRandomCompletedHabitsWithGoal(): HabitWithGoal[] {
    const completedHabits = this.$habitsWithGoal().filter(
      (habitGoalPair) => habitGoalPair.habit.latestProgress.completed
    );

    console.log('incompleteHabit', this.incompleteHabit);

    const numberToPick = this.incompleteHabit ? 1 : 2;
    return getNumberOfRandomElements(completedHabits, numberToPick);
  }
}

export type HabitWithGoal = {
  goal: Goal;
  habit: Habit;
};

// ##maybe in utils
export function getNumberOfRandomElements<T>(
  arr: T[],
  numberToPick: number
): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, numberToPick); // Pick 1 or 2 elements based on the condition
}
