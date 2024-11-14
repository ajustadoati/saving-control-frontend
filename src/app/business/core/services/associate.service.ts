import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { MemberAssociate } from '../../interfaces/memberAssociate';

@Injectable({
  providedIn: 'root'
})
export class AssociateService {

  private apiUrl = environment.baseUrl + '/api/users';

  private members: MemberAssociate[] = [];
  private pageData: any; 

  constructor(private http: HttpClient) {}

  getAssociatesByUserId(userId: number): Observable<any> {
    console.log("Getting default Payments: ", userId)
    return this.http.get<any>(`${this.apiUrl}/${userId}/associates`).pipe(
      map((response) => {
        // Extrae los usuarios desde _embedded.collection y los datos de paginación
        this.members  = response;

        return { members: this.members };
      })
    );
  }

  addAssociate(userId: number, associateId: number, relationship: string){
    const associateRequest = {associateId: associateId, relationship: relationship};

    console.log("Add associate");
    return this.http.post(`${this.apiUrl}/${userId}/associates`, associateRequest).pipe(
      map((response) => {
        return { repsonse: response };
      })
    );
  }

  removeAssociate(userId: number, associateId: number){

    return this.http.delete<void>(`${this.apiUrl}/${userId}/associates/${associateId}`);
    
  }
}
