import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { Associate } from '../../interfaces/associate';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.baseUrl + '/api/users'; 
  
  private cachedUsers: Associate[] = []; // Almacena los usuarios en memoria
  private pageData: any; 

  constructor(private http: HttpClient) {}



  getUsers(page: number = 1, size: number = 10): Observable<any> {

    if (this.cachedUsers.length > 0) {
      console.log('Using cache');
      return of({ users: this.cachedUsers, pageData: this.pageData });
    }

    
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
      map((response) => {
        // Extrae los usuarios desde _embedded.collection y los datos de paginación
        this.cachedUsers  = response._embedded ? response._embedded.collection : [];
        this.pageData = response.page;

        return { users: this.cachedUsers, pageData: this.pageData };
      })
    );
  }

  clearCache(): void {
    this.cachedUsers = [];
    this.pageData = null;
  }
}
