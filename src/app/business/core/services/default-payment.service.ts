import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class DefaultPaymentService {

  private apiUrl = environment.baseUrl + '/api/users';

  constructor(private http: HttpClient) {}

  registerPayment(userId: number, paymentData: { defaultPaymentName: string; amount: number }): Observable<any> {
    console.log("Saving default payment");
    return this.http.post<any>(`${this.apiUrl}/${userId}/defaultPayments`, paymentData).pipe(
      map((response) => {
        return { saving: response };
      })
    );
  }
}
