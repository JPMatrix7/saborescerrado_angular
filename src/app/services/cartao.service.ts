import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cartao } from '@models/cartao.model';

@Injectable({
  providedIn: 'root'
})
export class CartaoService {
  private baseUrl = 'http://localhost:8080/cartao';
  private adminUrl = 'http://localhost:8080/cartao/admin';

  constructor(private http: HttpClient) {}

  list(): Observable<Cartao[]> {
    return this.http.get<Cartao[]>(this.baseUrl);
  }

  adminList(page: number = 0, pageSize: number = 100): Observable<Cartao[]> {
    return this.http.get<Cartao[]>(`${this.adminUrl}/${page}/${pageSize}`);
  }

  count(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  getById(id: number): Observable<Cartao> {
    return this.http.get<Cartao>(`${this.baseUrl}/${id}`);
  }

  adminGetById(id: number): Observable<Cartao> {
    return this.http.get<Cartao>(`${this.adminUrl}/id/${id}`);
  }

  create(payload: Cartao): Observable<Cartao> {
    return this.http.post<Cartao>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<Cartao>): Observable<Cartao> {
    return this.http.put<Cartao>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
