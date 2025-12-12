import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private baseUrl = 'http://localhost:8080/categoria';

  constructor(private httpClient: HttpClient) { }

  // --- Métodos novos no estilo do exemplo ---
  getCategorias(page?: number, pageSize?: number): Observable<Categoria[]> {
    if (page !== undefined && pageSize !== undefined) {
      return this.httpClient.get<Categoria[]>(`${this.baseUrl}/admin/${page}/${pageSize}`);
    }
    return this.httpClient.get<Categoria[]>(this.baseUrl);
  }

  buscarPorId(id: string): Observable<Categoria> {
    return this.httpClient.get<Categoria>(`${this.baseUrl}/${id}`);
  }

  incluir(categoria: any): Observable<Categoria> {
    return this.httpClient.post<Categoria>(this.baseUrl, categoria);
  }

  alterar(categoria: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/${categoria.id}`, categoria);
  }

  excluir(categoria: Categoria): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${categoria.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  // --- Métodos compatíveis com os componentes existentes ---
  // findAll mantém compatibilidade com quem chama sem paginação
  findAll(): Observable<Categoria[]> {
    return this.getCategorias();
  }

  // findById aceita number (componentes usam number)
  findById(id: number): Observable<Categoria> {
    return this.httpClient.get<Categoria>(`${this.baseUrl}/${id}`);
  }

  create(categoria: Categoria): Observable<Categoria> {
    return this.incluir(categoria);
  }

  update(id: number, categoria: Categoria): Observable<Categoria> {
    return this.httpClient.put<Categoria>(`${this.baseUrl}/${id}`, categoria);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
