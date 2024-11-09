import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../interfaces/product';
import { environment } from '../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = environment.baseUrl + "/api/products";

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  
}
