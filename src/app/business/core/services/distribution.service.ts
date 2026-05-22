import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { DistributionInterestStatus } from '../../interfaces/distribution-interest-status';

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  private apiUrl = environment.baseUrl + '/api/distributions'; 
    
constructor(private http: HttpClient) {}

  runDistribution(date: string) {
    return this.http.post(`${this.apiUrl}/run?date=${encodeURIComponent(date)}`, {});
  }

  getDistributionStatus(date: string) {
    return this.http.get<DistributionInterestStatus>(`${this.apiUrl}/status?date=${encodeURIComponent(date)}`);
  }
}
