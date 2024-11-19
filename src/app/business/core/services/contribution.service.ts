import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { ContributionType } from '../../interfaces/contributionType';

@Injectable({
  providedIn: 'root'
})
export class ContributionService {

  

  private apiUrl = environment.baseUrl + '/api/contributions'; 
  
  private cachedSavings: ContributionType[] = [];


  constructor(private http: HttpClient) {}

  addContribution(contributionData: any) {
    console.log("Saving default payment", contributionData);
    return this.http.post<any>(`${this.apiUrl}`, contributionData).pipe(
      map((response) => {
        return { saving: response };
      })
    );
  }

  getContributions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }


  delete(contributionId: number): Observable<void> {
    console.log("Deleting default Contribution: ", contributionId)
    return this.http.delete<void>(`${this.apiUrl}/${contributionId}`);
  }


}
