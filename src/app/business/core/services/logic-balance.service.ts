import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';

export interface LogicBalance {
  initialBalance: number;
  currentBalance: number;
}

@Injectable({ providedIn: 'root' })
export class LogicBalanceService {
  private readonly apiUrl = environment.baseUrl + '/api/logic-balance';

  constructor(private http: HttpClient) {}

  getBalance() {
    return this.http.get<LogicBalance>(this.apiUrl);
  }

  registerPayment(date: string, amount: number, requestId: string) {
    return this.http.post<LogicBalance>(`${this.apiUrl}/payments`, { date, amount, requestId });
  }
}
