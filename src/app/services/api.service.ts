import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Headquarter, CalendarEvent, CreateVisitDto } from '../models/visit.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHeadquarters(): Observable<Headquarter[]> {
    return this.http.get<Headquarter[]>(`${this.baseUrl}/api/headquarters`).pipe(
      timeout(30000),
      retry(2)
    );
  }

  getCalendarEvents(headquarterId: number): Observable<CalendarEvent[]> {
    return this.http
      .get<CalendarEvent[]>(`${this.baseUrl}/api/calendar?headquarterId=${headquarterId}`)
      .pipe(timeout(30000), retry(2));
  }

  createVisit(data: CreateVisitDto): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${this.baseUrl}/api/calendar`, data).pipe(timeout(30000));
  }
}
