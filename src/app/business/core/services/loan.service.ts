import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { Loan } from '../../interfaces/loan';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  private apiUrl = environment.baseUrl + '/api/loans';

  constructor(private http: HttpClient) {}

  getLoans(userId: number): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}/user/${userId}`);
  }

  getLoansAssets(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.apiUrl}`);
  }
  
  saveLoan(loan: Loan): Observable<any> {
    console.log("Add loan", loan);
    return this.http.post<any>(`${this.apiUrl}`, loan).pipe(
      map((response) => {
        return { loanResponse: response};
      })
    );
  }
}
