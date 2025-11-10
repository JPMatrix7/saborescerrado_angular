import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cidade } from '../models/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class CidadeService {
  private baseUrl = 'http://localhost:8080/cidade';

  constructor(private httpClient: HttpClient) { }

  // Métodos no estilo do exemplo fornecido
  getCidades(page?: number, pageSize?: number): Observable<Cidade[]> {
    let params = {};

    if ((page !== undefined) && (pageSize !== undefined)) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      };
    }

    return this.httpClient.get<Cidade[]>(this.baseUrl, { params });
  }

  buscarPorId(id: string): Observable<Cidade> {
    return this.httpClient.get<Cidade>(`${this.baseUrl}/${id}`);
  }

  incluir(cidade: any): Observable<Cidade> {
    return this.httpClient.post<Cidade>(this.baseUrl, cidade);
  }

  alterar(cidade: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/${cidade.id}`, cidade);
  }

  excluir(cidade: Cidade): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${cidade.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  // Métodos compatíveis com componentes existentes
  findAll(): Observable<Cidade[]> {
    return this.getCidades();
  }

  findAllPaginated(page: number, pageSize: number): Observable<Cidade[]> {
    return this.httpClient.get<Cidade[]>(`${this.baseUrl}/${page}/${pageSize}`);
  }

  findById(id: number): Observable<Cidade> {
    return this.httpClient.get<Cidade>(`${this.baseUrl}/${id}`);
  }

  findByEstado(estadoId: number): Observable<Cidade[]> {
    return this.httpClient.get<Cidade[]>(`${this.baseUrl}/estado/${estadoId}`);
  }

  create(cidade: Cidade): Observable<Cidade> {
    return this.incluir(cidade);
  }

  update(id: number, cidade: Cidade): Observable<Cidade> {
    return this.httpClient.put<Cidade>(`${this.baseUrl}/${id}`, cidade);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Métodos específicos da API
  getByNome(nome: string): Observable<Cidade[]> {
    return this.httpClient.get<Cidade[]>(`${this.baseUrl}/nome/${nome}`);
  }
}
