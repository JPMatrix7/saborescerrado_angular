import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario, PessoaFisicaDTO, UsuarioCreateDTO } from '../models/usuario.model';
import { Perfil } from '../models/enums.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = 'http://localhost:8080/usuario';

  constructor(private httpClient: HttpClient) {}

  // Listar paginado
  getAll(page: number = 0, pageSize: number = 10): Observable<Usuario[]> {
    return this.httpClient
      .get<Usuario[]>(`${this.baseUrl}/${page}/${pageSize}`)
      .pipe(map((usuarios) => (Array.isArray(usuarios) ? usuarios.map((u) => this.normalizeUsuario(u)) : [])));
  }

  // Buscar por ID
  getById(id: number): Observable<Usuario> {
    return this.httpClient
      .get<Usuario>(`${this.baseUrl}/id/${id}`)
      .pipe(map((usuario) => this.normalizeUsuario(usuario)));
  }

  // Buscar dados do usuário logado
  getMe(): Observable<Usuario> {
    return this.httpClient
      .get<Usuario>(`${this.baseUrl}/me`)
      .pipe(map((usuario) => this.normalizeUsuario(usuario)));
  }

  // Criar PF via admin
  create(dto: UsuarioCreateDTO): Observable<Usuario> {
    return this.httpClient.post<Usuario>(`${this.baseUrl}/admin`, dto);
  }

  // Criar PJ via admin
  createPJ(dto: any): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/admin`, dto);
  }

  // Atualizar completo (PUT /usuario/{id})
  update(id: number, dto: PessoaFisicaDTO): Observable<void> {
    return this.httpClient.put<void>(`${this.baseUrl}/${id}`, dto);
  }

  // Atualizar perfis (ADMIN)
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

  // Atualizar login
  updateLogin(id: number, login: string): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/login/${id}`, { login });
  }

  // Atualizar senha
  updateSenha(id: number, senha: string): Observable<void> {
    return this.httpClient.patch<void>(`${this.baseUrl}/senha/${id}`, { senha });
  }

  // Alternar status ativo/inativo
  toggleStatus(id: number): Observable<Usuario> {
    return this.httpClient
      .patch<Usuario>(`${this.baseUrl}/status/${id}`, {})
      .pipe(map((usuario) => this.normalizeUsuario(usuario)));
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

  private normalizeUsuario(usuario: Usuario): Usuario {
    const cpfLimpo = (usuario.cpf || '').replace(/\D/g, '');

    return {
      ...usuario,
      cpf: cpfLimpo,
      perfis: usuario.perfis || [],
      ativo: usuario.ativo ?? false,
      dataInclusao: usuario.dataInclusao || '',
      enderecos: usuario.enderecos || [],
      cartoes: usuario.cartoes || [],
      telefones: usuario.telefones || [],
      favoritos: usuario.favoritos || [],
      compras: usuario.compras || []
    };
  }
}
