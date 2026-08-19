import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';
import { SavingsOnboardingRequest } from '../../interfaces/savings-onboarding-request';
import { SavingsOnboardingResponse } from '../../interfaces/savings-onboarding-response';
import { Summary } from '../../interfaces/summary';
import { WithdrawalRequest } from '../../interfaces/withdrawal-request';
import { WithdrawalResponse } from '../../interfaces/withdrawal-response';

@Injectable({
  providedIn: 'root'
})
export class UserBalanceService {
  private apiUrl = environment.baseUrl + '/api/summary';
  
  constructor(private http: HttpClient) {}

  getSummary(userId: number): Observable<Summary> {
    return this.http.get<Summary>(`${this.apiUrl}/${userId}`);
  }

  saveSavingsOnboarding(userId: number, request: SavingsOnboardingRequest): Observable<SavingsOnboardingResponse> {
    return this.http.post<SavingsOnboardingResponse>(
      `${environment.baseUrl}/api/users/${userId}/savings-onboarding`,
      request
    );
  }

  withdrawFunds(withdrawalRequest: WithdrawalRequest): Observable<WithdrawalResponse> {
    return this.http.post<WithdrawalResponse>(`${this.apiUrl}/withdraw`, withdrawalRequest);
  }

}
