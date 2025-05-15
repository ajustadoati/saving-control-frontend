import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';
import { Supplies } from '../../interfaces/supplies';

@Injectable({
  providedIn: 'root'
})
export class SuppliesService {

  private apiUrl = environment.baseUrl + '/api/supplies';
  
  constructor(private http: HttpClient) {}


  getSupplies(userId: number): Observable<Supplies[]> {
    return this.http.get<Supplies[]>(`${this.apiUrl}/user/${userId}`);
  }

  createSupply(supply: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, supply); // Enviar el objeto directamente
  }


}
