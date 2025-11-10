import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PessoaFisica } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = 'http://localhost:8080/usuario';

  constructor(private httpClient: HttpClient) { }

  // Métodos no estilo do exemplo fornecido
  getUsuarios(page?: number, pageSize?: number): Observable<PessoaFisica[]> {
    let params = {};

    if ((page !== undefined) && (pageSize !== undefined)) {
      params = {
        page: page.toString(),
        page_size: pageSize.toString()
      };
    }

    return this.httpClient.get<PessoaFisica[]>(this.baseUrl, { params });
  }

  buscarPorId(id: string): Observable<PessoaFisica> {
    return this.httpClient.get<PessoaFisica>(`${this.baseUrl}/${id}`);
  }

  incluir(cliente: any): Observable<PessoaFisica> {
    return this.httpClient.post<PessoaFisica>(this.baseUrl, cliente);
  }

  alterar(cliente: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/${cliente.id}`, cliente);
  }

  excluir(cliente: PessoaFisica): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}/${cliente.id}`);
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  // Métodos compatíveis com componentes existentes
  findAll(): Observable<PessoaFisica[]> {
    return this.getUsuarios();
  }

  findAllPaginated(page: number, pageSize: number): Observable<PessoaFisica[]> {
    return this.httpClient.get<PessoaFisica[]>(`${this.baseUrl}/${page}/${pageSize}`);
  }

  findById(id: number): Observable<PessoaFisica> {
    return this.httpClient.get<PessoaFisica>(`${this.baseUrl}/${id}`);
  }

  findByCpf(cpf: string): Observable<PessoaFisica> {
    return this.httpClient.get<PessoaFisica>(`${this.baseUrl}/cpf/${cpf}`);
  }

  create(cliente: PessoaFisica): Observable<PessoaFisica> {
    return this.incluir(cliente);
  }

  update(id: number, cliente: PessoaFisica): Observable<PessoaFisica> {
    return this.httpClient.put<PessoaFisica>(`${this.baseUrl}/${id}`, cliente);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Métodos específicos da API
  getByNome(nome: string): Observable<PessoaFisica[]> {
    return this.httpClient.get<PessoaFisica[]>(`${this.baseUrl}/nome/${nome}`);
  }

  updateSenha(id: number, senha: string): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/senha/${id}`, { senha });
  }

  updateEmail(id: number, email: string): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/email/${id}`, { email });
  }

  updateNome(id: number, nome: string): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/nome/${id}`, { nome });
  }

  resetarSenha(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/resetarsenha/${id}`, {});
  }
}
