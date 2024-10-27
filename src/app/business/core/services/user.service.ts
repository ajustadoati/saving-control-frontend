import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { Associate } from '../../interfaces/associate';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.baseUrl + '/api/users'; 
  
  private cachedUsers: Associate[] = []; // Almacena los usuarios en memoria
  private pageData: any; 
  private users: User[]=[];

  constructor(private http: HttpClient) {}



  getUsers(page: number = 1, size: number = 10): Observable<any> {
    
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
      map((response) => {
        // Extrae los usuarios desde _embedded.collection y los datos de paginación
        this.cachedUsers  = response._embedded ? response._embedded.collection : [];
        this.pageData = response.page;

        return { users: this.cachedUsers, pageData: this.pageData };
      })
    );
  }

  getAssociateByNumberId(numberId: string): Observable<any> {
    // Primero busca en la caché
    const cachedAssociate = this.cachedUsers.find(user => user.numberId === numberId);
  
    if (cachedAssociate) {
      console.log('Using cached associate');
      return of(cachedAssociate);
    }
  
    // Si no está en la caché, busca en el backend
    console.log('Fetching associate from API');
    return this.http.get<any>(`${this.apiUrl}/numberId/${numberId}`).pipe(
      map(response => {
        // Opcionalmente, guarda el resultado en la caché si deseas que futuras búsquedas lo utilicen
        this.cachedUsers.push(response);
        return response;
      })
    );
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map((response) => {
        this.users = response._embedded ? response._embedded.collection : [];
        return { users: this.users };
      })
    );
  }

  getUsersWithSavings(weekStart: string, weekEnd: string, page: number = 0, size: number = 15): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/savings?startDate=${weekStart}&endDate=${weekEnd}&size=${size}&page=${page}`).pipe(
      map((response) => {
        console.log("service", response)
        this.users = response._embedded ? response._embedded.collection : [];
        return { users: this.users, size: response.page.size, totalElements:response.page.totalElements, totalPages: response.page.totalPages};
      })
    );
  }
  /**
   * "size": 15,
        "totalElements": 71,
        "totalPages": 5,
        "number": 0
   */
  

  clearCache(): void {
    this.cachedUsers = [];
    this.pageData = null;
  }
}
