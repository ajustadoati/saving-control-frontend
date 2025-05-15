import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';
import { Supplies } from '../../interfaces/supplies';

@Injectable({
  providedIn: 'root'
})
export class SuppliesPaymentService {

  private apiUrl = environment.baseUrl + '/api/supplies'

  constructor(private http: HttpClient) {
  }

  getSuppliesPayment(userId: number): Observable<Supplies[]>{
    return this.http.get<Supplies[]>(`${this.apiUrl}/${userId}/payments`)
  }
}

