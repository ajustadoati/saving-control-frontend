import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { LoanType } from '../../interfaces/loanType';

@Injectable({
  providedIn: 'root'
})
export class LoanTypeService {

  private apiUrl = environment.baseUrl + "/api/loan-types";

  constructor(private http: HttpClient) {}

  getLoanTypes(): Observable<LoanType[]> {
    return this.http.get<LoanType[]>(this.apiUrl);
  }
}
