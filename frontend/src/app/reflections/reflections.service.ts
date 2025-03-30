import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { StandardResponse } from '@backend/types/standardResponse';
import { Reflection } from '@backend/reflections/reflections.types';
import { environment } from 'frontend/src/environments/environment';
import { ProgressService } from '../progresses/progresses.service';
import { toLocalDateString } from '../utils/utils';
import { StatBase } from '@backend/progresses/progress.types';
import { StatsService } from '../progresses/stats.service';

@Injectable({
  providedIn: 'root',
})
export class ReflectionsService {
  #http = inject(HttpClient);
  progressService = inject(ProgressService);
  statsService = inject(StatsService);
  
  $reflection = signal<Reflection | null>(null);

  $reflectionStats = signal<StatBase | null>(null);
  // ## effect on change of timestep, but we need separted timesteps for stats and dailyprogress

  // for daily progress
  setReflectionOnDateChange = effect(() => {
    const dateString = toLocalDateString(
      this.progressService.$dailyProgressDate()
    );

    this.get_reflection(dateString).subscribe((response) => {
      if (response.success) {
        this.$reflection.set(response.data);
        console.log('Reflection:', response.data);
      }
    });
  });


  // forStats

    triggerLoadReflectionStats = effect(() => {
   
      this.loadReflectionStats();
        });
  

  loadReflectionStats = async () => {

    const { startDate, endDate } = this.statsService.$progressDateRange();

    this.get_reflection_stats(startDate, endDate).subscribe((response) => {
      if (response.success) {
        this.$reflectionStats.set(response.data);
        console.log('Reflection Stats:', response.data);
      }
    }); 
  }



  // __________ HTTP REQUESTS __________

  get_reflection(dateStringWithoutTime: string) {
    return this.#http.get<StandardResponse<Reflection>>(
      environment.SERVER_URL + '/reflections' + '?date=' + dateStringWithoutTime
    );
  }

  put_reflection(reflection: Reflection) {
    return this.#http.put<StandardResponse<number>>(
      environment.SERVER_URL + '/reflections' + '/' + reflection._id,
      reflection
    );
  }


   get_reflection_stats(startDate: Date, endDate: Date) {
      const params = new HttpParams()
        .set('startDate', startDate.toISOString())
        .set('endDate', endDate.toISOString());
  
      return this.#http.get<StandardResponse<StatBase>>(
        environment.SERVER_URL + '/reflections' +'/' + 'stats',
        {
          params,
        }
      );
    }
}
