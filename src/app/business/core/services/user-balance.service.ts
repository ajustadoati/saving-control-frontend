import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';
import { Summary } from '../../interfaces/summary';

@Injectable({
  providedIn: 'root'
})
export class UserBalanceService {
  private apiUrl = environment.baseUrl + '/api/summary';
  
  constructor(private http: HttpClient) {}

  getSummary(userId: number): Observable<Summary> {
    return this.http.get<Summary>(`${this.apiUrl}/${userId}`);
  }

}
