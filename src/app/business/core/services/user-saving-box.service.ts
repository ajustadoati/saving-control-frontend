import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { UserSavingsBox } from '../../interfaces/userSavingBox';

@Injectable({
  providedIn: 'root'
})
export class UserSavingBoxService {

  private apiUrl = environment.baseUrl + '/api/users/savings-box';

  constructor(private http: HttpClient) {}

  getSavingBox(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`).pipe(
      map((response) => {
        return { response: response};
      })
    );

  }

  saveSavingBox(savingBox: UserSavingsBox): Observable<any> {
    console.log("Add savingBox", savingBox);
    return this.http.post<any>(`${this.apiUrl}`, savingBox).pipe(
      map((response) => {
        return { savingBoxResponse: response};
      })
    );
  }
}
