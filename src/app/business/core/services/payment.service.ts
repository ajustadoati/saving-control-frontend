import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Saving } from '../../interfaces/saving';
import { Observable, map } from 'rxjs';
import { Payment } from '../../interfaces/payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.baseUrl + '/api/payments';

  constructor(private http: HttpClient) {}

  addPaymentListByUserId(userId: number, payment: Payment): Observable<any> {
    console.log("Add payment", payment);
    return this.http.post<any>(`${this.apiUrl}`, payment).pipe(
      map((response) => {
        return { paymentResponse: response};
      })
    );
  }
}
