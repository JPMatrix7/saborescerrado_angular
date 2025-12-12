import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estado } from '../models/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private baseUrl = 'http://localhost:8080/estado';
  private adminUrl = 'http://localhost:8080/estado/admin';

  constructor(private httpClient: HttpClient) { }

  // Métodos no estilo do exemplo fornecido
  getEstados(page?: number, pageSize?: number): Observable<Estado[]> {
    if (page !== undefined && pageSize !== undefined) {
      return this.httpClient.get<Estado[]>(`${this.adminUrl}/${page}/${pageSize}`);
    }
    return this.httpClient.get<Estado[]>(this.baseUrl);
  }

  buscarPorId(id: string): Observable<Estado> {
    return this.httpClient.get<Estado>(`${this.baseUrl}/${id}`);
  }

  incluir(estado: any): Observable<Estado> {
    return this.httpClient.post<Estado>(this.baseUrl, estado);
  }

  alterar(estado: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/${estado.id}`, estado);
  }

  excluir(estado: Estado): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${estado.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  // Métodos compatíveis com componentes existentes
  findAll(): Observable<Estado[]> {
    return this.getEstados();
  }

  findById(id: number): Observable<Estado> {
    return this.httpClient.get<Estado>(`${this.baseUrl}/${id}`);
  }

  create(estado: Estado): Observable<Estado> {
    return this.incluir(estado);
  }

  update(id: number, estado: Estado): Observable<Estado> {
    return this.httpClient.put<Estado>(`${this.baseUrl}/${id}`, estado);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Métodos específicos da API
  getByNome(nome: string): Observable<Estado[]> {
    return this.httpClient.get<Estado[]>(`${this.baseUrl}/nome/${nome}`);
  }

  getBySigla(sigla: string): Observable<Estado> {
    return this.httpClient.get<Estado>(`${this.baseUrl}/sigla/${sigla}`);
  }
}
