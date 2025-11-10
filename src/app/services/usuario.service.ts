import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, PessoaFisica, PessoaFisicaDTO } from '../models/usuario.model';
import { Perfil } from '../models/enums.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = 'http://localhost:8080/usuario';

  constructor(private httpClient: HttpClient) { }

  // Listar paginado
  getAll(page: number = 0, pageSize: number = 10): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(`${this.baseUrl}/${page}/${pageSize}`);
  }

  // Buscar por ID
  getById(id: number): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.baseUrl}/id/${id}`);
  }

  // Criar usuário
  create(dto: PessoaFisicaDTO): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.baseUrl, dto);
  }

  // Atualizar completo
  update(id: number, dto: PessoaFisicaDTO): Observable<void> {
    return this.httpClient.put<void>(`${this.baseUrl}/${id}`, dto);
  }

  // Atualizar perfis
  updatePerfis(id: number, perfis: Perfil[]): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/perfis/${id}`, perfis);
  }

  // Atualizar nome
  updateNome(id: number, nome: string): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/nome/${id}`, { nome });
  }

  // Atualizar email
  updateEmail(id: number, email: string): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/email/${id}`, { email });
  }

  // Atualizar senha
  updateSenha(id: number, senha: string): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/senha/${id}`, { senha });
  }

  // Deletar (soft delete)
  delete(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/delete/${id}`, {});
  }

  // Resetar senha
  resetarSenha(id: number): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/resetarsenha/${id}`, {});
  }

  // Contar total
  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.baseUrl}/count`);
  }

  // Métodos compatíveis com componentes existentes (para backward compatibility)
  findAll(): Observable<Usuario[]> {
    return this.getAll(0, 100); // Retorna até 100 usuários para listagem simples
  }

  findById(id: number): Observable<Usuario> {
    return this.getById(id);
  }
}
