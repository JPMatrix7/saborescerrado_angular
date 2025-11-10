import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Licor } from '../models/licor.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private baseUrl = 'http://localhost:8080/licor';

  constructor(private httpClient: HttpClient) { }

  // Métodos no estilo do exemplo fornecido
  getLicores(page?: number, pageSize?: number): Observable<Licor[]> {
    let params = {};

    if ((page !== undefined) && (pageSize !== undefined)) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      };
    }

    return this.httpClient.get<Licor[]>(this.baseUrl, { params });
  }

  buscarPorId(id: string): Observable<Licor> {
    return this.httpClient.get<Licor>(`${this.baseUrl}/${id}`);
  }

  incluir(licor: any): Observable<Licor> {
    return this.httpClient.post<Licor>(this.baseUrl, licor);
  }

  alterar(licor: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/${licor.id}`, licor);
  }

  excluir(licor: Licor): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${licor.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  // Métodos compatíveis com componentes existentes
  findAll(): Observable<Licor[]> {
    return this.getLicores();
  }

  findById(id: number): Observable<Licor> {
    return this.httpClient.get<Licor>(`${this.baseUrl}/${id}`);
  }

  findByCategoria(categoriaId: number): Observable<Licor[]> {
    return this.httpClient.get<Licor[]>(`${this.baseUrl}/categoria/${categoriaId}`);
  }

  create(licor: Licor): Observable<Licor> {
    return this.incluir(licor);
  }

  update(id: number, licor: Licor): Observable<Licor> {
    return this.httpClient.put<Licor>(`${this.baseUrl}/${id}`, licor);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Métodos específicos da API
  getByNome(nome: string): Observable<Licor[]> {
    return this.httpClient.get<Licor[]>(`${this.baseUrl}/nome/${nome}`);
  }

  getByTipo(tipo: number): Observable<Licor[]> {
    return this.httpClient.get<Licor[]>(`${this.baseUrl}/tipo/${tipo}`);
  }

  getVisiveis(): Observable<Licor[]> {
    return this.httpClient.get<Licor[]>(`${this.baseUrl}/visiveis`);
  }
}
