import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Saving } from '../../interfaces/saving';
import { Observable, map } from 'rxjs';
import { Payment } from '../../interfaces/payment';
import { RevertPaymentRequest } from '../../interfaces/revert-payment-request';
import { RevertPaymentResponse } from '../../interfaces/revert-payment-response';

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
  
  removePaymentByDateAndCedula(cedula: number, date: string): Observable<any> {
    const payload = { cedula, date };
    console.log('Datos recibidos para eliminar:', payload);
    return this.http.delete<any>(`${this.apiUrl}`, { body: payload });
  }

  revertPayment(request: RevertPaymentRequest): Observable<RevertPaymentResponse> {
    console.log('Revirtiendo pago:', request);
    return this.http.post<RevertPaymentResponse>(`${this.apiUrl}/reverse`, request);
  }
}
