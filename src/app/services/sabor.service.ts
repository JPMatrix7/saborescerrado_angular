import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sabor } from '../models/licor.model';

@Injectable({
  providedIn: 'root'
})
export class SaborService {
  private baseUrl = 'http://localhost:8080/sabor';

  constructor(private httpClient: HttpClient) { }

  // Métodos no estilo do exemplo fornecido
  getSabores(page?: number, pageSize?: number): Observable<Sabor[]> {
    let params = {};

    if ((page !== undefined) && (pageSize !== undefined)) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      };
    }

    return this.httpClient.get<Sabor[]>(this.baseUrl, { params });
  }

  buscarPorId(id: string): Observable<Sabor> {
    return this.httpClient.get<Sabor>(`${this.baseUrl}/${id}`);
  }

  incluir(sabor: any): Observable<Sabor> {
    return this.httpClient.post<Sabor>(this.baseUrl, sabor);
  }

  alterar(sabor: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/${sabor.id}`, sabor);
  }

  excluir(sabor: Sabor): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${sabor.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  // Métodos compatíveis com componentes existentes
  findAll(): Observable<Sabor[]> {
    return this.getSabores();
  }

  findById(id: number): Observable<Sabor> {
    return this.httpClient.get<Sabor>(`${this.baseUrl}/${id}`);
  }

  create(sabor: Sabor): Observable<Sabor> {
    return this.incluir(sabor);
  }

  update(id: number, sabor: Sabor): Observable<Sabor> {
    return this.httpClient.put<Sabor>(`${this.baseUrl}/${id}`, sabor);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Métodos específicos da API
  getByNome(nome: string): Observable<Sabor[]> {
    return this.httpClient.get<Sabor[]>(`${this.baseUrl}/nome/${nome}`);
  }
}
