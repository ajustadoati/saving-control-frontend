import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private apiUrl = environment.baseUrl + "/api/file";

  constructor(private http: HttpClient) { 
  }

  upload(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
  
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      responseType: 'json'
    });
  }

  download(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download`, {
      responseType: 'blob'
    });
  }
}
