import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Premiacao } from '@models/licor.model';

@Injectable({
  providedIn: 'root'
})
export class PremiacaoService {
  private baseUrl = 'http://localhost:8080/premiacao';
  private adminUrl = 'http://localhost:8080/premiacao/admin';

  constructor(private http: HttpClient) {}

  list(): Observable<Premiacao[]> {
    return this.http.get<Premiacao[]>(this.baseUrl);
  }

  adminList(page: number = 0, pageSize: number = 100): Observable<Premiacao[]> {
    return this.http.get<Premiacao[]>(`${this.adminUrl}/${page}/${pageSize}`);
  }

  count(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  getById(id: number): Observable<Premiacao> {
    return this.http.get<Premiacao>(`${this.baseUrl}/${id}`);
  }

  adminGetById(id: number): Observable<Premiacao> {
    return this.http.get<Premiacao>(`${this.adminUrl}/id/${id}`);
  }

  getByEvento(evento: string): Observable<Premiacao[]> {
    return this.http.get<Premiacao[]>(`${this.baseUrl}/evento/${evento}`);
  }

  getByAno(ano: number): Observable<Premiacao[]> {
    return this.http.get<Premiacao[]>(`${this.baseUrl}/ano/${ano}`);
  }

  create(payload: Premiacao): Observable<Premiacao> {
    return this.http.post<Premiacao>(this.baseUrl, payload);
  }

  update(id: number, payload: Premiacao): Observable<Premiacao> {
    return this.http.put<Premiacao>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
