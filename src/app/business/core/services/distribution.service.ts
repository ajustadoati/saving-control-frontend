import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  private apiUrl = environment.baseUrl + '/api/distributions'; 
    
constructor(private http: HttpClient) {}

  saveDistributions(data: {
    date: string,
    distributionInterestList: {
      userId: number,
      name: string,
      totalBalance: number,
      distributedAmount: number
    }[]
  }) {
    return this.http.post(this.apiUrl, data);
  }
}
