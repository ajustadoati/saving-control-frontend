import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';
import { Supplies } from '../../interfaces/supplies';


@Injectable({
  providedIn: 'root'
})
export class LoanPaymentService {



  private apiUrl = environment.baseUrl + '/api/loans'

  constructor(private http: HttpClient) {
  }

  getLoansPayment(userId: number): Observable<Supplies[]>{
    return this.http.get<Supplies[]>(`${this.apiUrl}/${userId}/payments`)
  }
}