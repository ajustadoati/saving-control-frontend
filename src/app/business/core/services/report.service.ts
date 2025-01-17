import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteDiarioResponse } from '../../interfaces/reporteDiarioResponse';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private apiUrl = environment.baseUrl + '/api/payments/report';

  constructor(private http: HttpClient) { }

  getReporteDiario(fecha: string): Observable<ReporteDiarioResponse> {
    return this.http.get<ReporteDiarioResponse>(`${this.apiUrl}/${fecha}`);
  }
  
}
