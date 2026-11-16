import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { DefaultPayment } from '../../interfaces/defaultPayments';

@Injectable({
  providedIn: 'root'
})
export class DefaultPaymentService {

  private apiUrl = environment.baseUrl + '/api/users';

  constructor(private http: HttpClient) {}

  registerPayment(userId: number, paymentData: { defaultPaymentName: string; amount: number }): Observable<any> {
    console.log("Saving default payment", paymentData);
    return this.http.post<any>(`${this.apiUrl}/${userId}/defaultPayments`, paymentData).pipe(
      map((response) => {
        return { saving: response };
      })
    );
  }

  getDefaultPaymentsByUserId(userId: number): Observable<{ defaultPayments: DefaultPayment[] }> {
    type Page = {
      _embedded?: { collection: DefaultPayment[] };
      page?: { number: number; totalPages: number };
    };
    const getPage = (page: number) => this.http.get<Page>(`${this.apiUrl}/${userId}/defaultPayments`, {
      params: { page, sort: 'id,asc' },
    });
    return getPage(0).pipe(
      expand(response => response.page && response.page.number + 1 < response.page.totalPages
        ? getPage(response.page.number + 1) : EMPTY),
      reduce((payments, response) => payments.concat(response._embedded?.collection ?? []), [] as DefaultPayment[]),
      map(defaultPayments => ({ defaultPayments }))
    );
  }

  deleteDefaultPayment(userId: number, paymentId: number): Observable<void> {
    console.log("Deleting default Payments: ", paymentId, userId)
    return this.http.delete<void>(`${this.apiUrl}/${userId}/defaultPayments/${paymentId}`);
  }


}
