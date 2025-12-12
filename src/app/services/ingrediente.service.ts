import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ingrediente } from '@models/licor.model';

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {
  private baseUrl = 'http://localhost:8080/ingrediente';
  private adminUrl = 'http://localhost:8080/ingrediente/admin';

  constructor(private http: HttpClient) {}

  list(): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>(this.baseUrl);
  }

  adminList(page: number = 0, pageSize: number = 100): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>(`${this.adminUrl}/${page}/${pageSize}`);
  }

  count(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  getById(id: number): Observable<Ingrediente> {
    return this.http.get<Ingrediente>(`${this.baseUrl}/${id}`);
  }

  adminGetById(id: number): Observable<Ingrediente> {
    return this.http.get<Ingrediente>(`${this.adminUrl}/id/${id}`);
  }

  getByNome(nome: string): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>(`${this.baseUrl}/nome/${nome}`);
  }

  create(payload: Ingrediente): Observable<Ingrediente> {
    return this.http.post<Ingrediente>(this.baseUrl, payload);
  }

  update(id: number, payload: Ingrediente): Observable<Ingrediente> {
    return this.http.put<Ingrediente>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
