import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { ContributionType } from '../../interfaces/contributionType';

@Injectable({
  providedIn: 'root'
})
export class ContributionTypesService {

  private apiUrl = environment.baseUrl + '/api/contribution-types'; 
  
  private cachedSavings: ContributionType[] = [];


  constructor(private http: HttpClient) {}

  getContributionTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }


  delete(contributionId: number): Observable<void> {
    console.log("Deleting default Contribution: ", contributionId)
    return this.http.delete<void>(`${this.apiUrl}/${contributionId}`);
  }

}