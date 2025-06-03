import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  constructor(private http: HttpClient) {}

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
    return this.http.post('/logs', logPayload);
  }
}