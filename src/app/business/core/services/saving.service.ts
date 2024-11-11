import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Saving } from '../../interfaces/saving';
import { Observable, of, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SavingService {

  private apiUrl = environment.baseUrl + '/api/users'; 
  
  private cachedSavings: Saving[] = [];
  private pageData: any; 

  constructor(private http: HttpClient) {}

  getSavingsByUserId(userId:number, page: number = 0, size: number = 10): Observable<any> {
    console.log('Seraching paymets for: ', userId);


    return this.http.get<any>(`${this.apiUrl}/${userId}/savings?page=${page}&size=${size}`).pipe(
      map((response) => {
        // Extrae los usuarios desde _embedded.collection y los datos de paginación
        this.cachedSavings  = response._embedded ? response._embedded.collection : [];
        this.pageData = response.page;

        return { savings: this.cachedSavings, pageData: this.pageData };
      })
    );
  }

  addSavingByUserId(userId: number, saving: Saving): Observable<any> {
    console.log("Add saving", saving);
    return this.http.post(`${this.apiUrl}/${userId}/savings`, saving).pipe(
      map((response) => {
        this.cachedSavings = [];
        return { saving: response };
      })
    );
  }

  addSavingListByUserId(userId: number, savings: Saving[]): Observable<any> {
    console.log("Add saving", savings);
    return this.http.post<any>(`${this.apiUrl}/${userId}/savingList`, savings).pipe(
      map((response) => {
        this.cachedSavings = [];
        return { savings: response._embedded ? response._embedded.collection : []};
      })
    );
  }

  getResume(): Observable<any> {
    return this.http.get(`${this.apiUrl}/savings/total`).pipe(
      map((response) => {
        return { response: response};
      })
    );

  }


  clearCache(): void {
    this.cachedSavings = [];
    this.pageData = null;
  }

}
