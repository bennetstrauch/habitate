import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'frontend/src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  #http = inject(HttpClient);

  logToBackend(
    level: 'INFO' | 'ERROR',
    message: string,
    component: string,
    data: any = null
  ): Observable<any> {
    const logPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: JSON.stringify(data, null, 2),
      component,
      userAgent: navigator.userAgent,
    };
    console.log('Logging to backend:', logPayload, environment.SERVER_URL + '/log');
    return this.#http.post( environment.SERVER_URL + '/log', logPayload);
  }
}