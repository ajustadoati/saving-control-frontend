import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { DefaultPayment } from '../../interfaces/defaultPayments';

@Injectable({
  providedIn: 'root'
})
export class DefaultPaymentService {

  private apiUrl = environment.baseUrl + '/api/users';

  private defaultPayments: DefaultPayment[] = [];
  private pageData: any; 

  constructor(private http: HttpClient) {}

  registerPayment(userId: number, paymentData: { defaultPaymentName: string; amount: number }): Observable<any> {
    console.log("Saving default payment");
    return this.http.post<any>(`${this.apiUrl}/${userId}/defaultPayments`, paymentData).pipe(
      map((response) => {
        return { saving: response };
      })
    );
  }

  getDefaultPaymentsByUserId(userId: number): Observable<any> {
    console.log("Getting default Payments: ", userId)
    return this.http.get<any>(`${this.apiUrl}/${userId}/defaultPayments`).pipe(
      map((response) => {
        // Extrae los usuarios desde _embedded.collection y los datos de paginación
        this.defaultPayments  = response._embedded ? response._embedded.defaultPaymentDtoList : [];

        return { defaultPayments: this.defaultPayments };
      })
    );
  }

  deleteDefaultPayment(userId: number, paymentId: number): Observable<void> {
    console.log("Deleting default Payments: ", paymentId, userId)
    return this.http.delete<void>(`${this.apiUrl}/${userId}/defaultPayments/${paymentId}`);
  }


}
