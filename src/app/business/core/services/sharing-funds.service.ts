import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { Funds } from '../../interfaces/funds';

@Injectable({
  providedIn: 'root'
})
export class SharingFundsService {

  private apiUrl = environment.baseUrl + '/api/sharing-funds'; 

  constructor(private http: HttpClient) {}

  getBalance(): Observable<Funds> {
    return this.http.get<Funds>(this.apiUrl);
  }
}