import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemCompra } from '@models/compra.model';

@Injectable({
  providedIn: 'root'
})
export class ItemCompraService {
  private baseUrl = 'http://localhost:8080/itemcompra';
  private adminUrl = 'http://localhost:8080/itemcompra/admin';

  constructor(private httpClient: HttpClient) {}

  list(): Observable<ItemCompra[]> {
    return this.httpClient.get<ItemCompra[]>(this.baseUrl);
  }

  adminList(page: number = 0, pageSize: number = 100): Observable<ItemCompra[]> {
    return this.httpClient.get<ItemCompra[]>(`${this.adminUrl}/${page}/${pageSize}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  getById(id: number): Observable<ItemCompra> {
    return this.httpClient.get<ItemCompra>(`${this.baseUrl}/${id}`);
  }

  adminGetById(id: number): Observable<ItemCompra> {
    return this.httpClient.get<ItemCompra>(`${this.adminUrl}/id/${id}`);
  }

  create(payload: ItemCompra): Observable<ItemCompra> {
    return this.httpClient.post<ItemCompra>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<ItemCompra>): Observable<ItemCompra> {
    return this.httpClient.put<ItemCompra>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
