import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { LubricantOrder } from '../../interfaces/lubricant-order';
import { LubricantProduct } from '../../interfaces/lubricant-product';
import { LubricantStockMovement } from '../../interfaces/lubricant-stock-movement';
import { LubricantWeeklyCollection } from '../../interfaces/lubricant-weekly-collection';

export interface LubricantProductRequest {
  code: string;
  name: string;
  costPrice: number;
  salePrice: number;
  initialStock: number;
}

export interface LubricantStockEntryRequest {
  quantity: number;
  movementDate: string;
  notes: string;
}

export interface LubricantOrderItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number | null;
}

export interface LubricantOrderRequest {
  userId: number;
  orderDate: string;
  weeklyInstallment?: number | null;
  installmentCount?: number | null;
  items: LubricantOrderItemRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class LubricantService {

  private readonly apiUrl = `${environment.baseUrl}/api/lubricants`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<LubricantProduct[]> {
    return this.http.get<LubricantProduct[]>(`${this.apiUrl}/products`);
  }

  createProduct(request: LubricantProductRequest): Observable<LubricantProduct> {
    return this.http.post<LubricantProduct>(`${this.apiUrl}/products`, request);
  }

  updateProduct(productId: number, request: LubricantProductRequest): Observable<LubricantProduct> {
    return this.http.put<LubricantProduct>(`${this.apiUrl}/products/${productId}`, request);
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${productId}`);
  }

  addStock(productId: number, request: LubricantStockEntryRequest): Observable<LubricantProduct> {
    return this.http.post<LubricantProduct>(`${this.apiUrl}/products/${productId}/stock-entries`, request);
  }

  getMovements(productId: number): Observable<LubricantStockMovement[]> {
    return this.http.get<LubricantStockMovement[]>(`${this.apiUrl}/products/${productId}/movements`);
  }

  createOrder(request: LubricantOrderRequest): Observable<LubricantOrder> {
    return this.http.post<LubricantOrder>(`${this.apiUrl}/orders`, request);
  }

  getOrdersByUser(userId: number): Observable<LubricantOrder[]> {
    return this.http.get<LubricantOrder[]>(`${this.apiUrl}/orders/user/${userId}`);
  }

  getWeeklyCollection(date: string): Observable<LubricantWeeklyCollection[]> {
    return this.http.get<LubricantWeeklyCollection[]>(`${this.apiUrl}/weekly-collection?date=${date}`);
  }
}
