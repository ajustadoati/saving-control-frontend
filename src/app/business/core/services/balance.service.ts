import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { ContributionType } from '../../interfaces/contributionType';
import { Observable } from 'rxjs/internal/Observable';
import { Funds } from '../../interfaces/funds';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {

  private apiUrl = environment.baseUrl + '/api/funds'; 

  constructor(private http: HttpClient) {}

  getBalance(): Observable<Funds> {
    return this.http.get<Funds>(this.apiUrl);
  }
}
