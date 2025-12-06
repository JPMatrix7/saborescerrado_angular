import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  CadastroPFRequest,
  CadastroPJRequest,
  UsuarioAuth
} from '@models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080';
  private tokenKey = 'auth_token';
  private tokenTypeKey = 'auth_token_type';
  private tokenExpiresKey = 'auth_token_expires';

  constructor(private http: HttpClient) {}

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, body).pipe(
      tap((response) => {
        this.saveToken(response.token);
        this.saveTokenType(response.tokenType);
        if (response.expiresIn) {
          const expiresAt = Date.now() + response.expiresIn * 1000;
          localStorage.setItem(this.tokenExpiresKey, String(expiresAt));
        }
        this.saveUser(response.usuario);
      }),
      catchError((err) => {
        const message =
          err?.error?.message ||
          err?.error ||
          'Credenciais inválidas. Verifique email e senha.';
        return throwError(() => ({ ...err, message }));
      })
    );
  } 

  registerPF(payload: CadastroPFRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario`, payload);
  }

  registerPJ(payload: CadastroPJRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/pessoajuridica`, payload);
  }

  me(): Observable<UsuarioAuth> {
    return this.http.get<UsuarioAuth>(`${this.baseUrl}/auth/me`).pipe(tap((user) => this.saveUser(user)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenTypeKey);
    localStorage.removeItem(this.tokenExpiresKey);
    localStorage.removeItem('auth_user');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getTokenType(): string {
    return localStorage.getItem(this.tokenTypeKey) || 'Bearer';
  }

  getAuthHeaderValue(): string | null {
    const token = this.getToken();
    if (!token) return null;
    return `${this.getTokenType()} ${token}`;
  }

  getUser(): UsuarioAuth | null {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioAuth;
    } catch {
      return null;
    }
  }

  saveUser(user: UsuarioAuth): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  updateStoredUser(partial: Partial<UsuarioAuth>): void {
    const current = this.getUser();
    if (current) {
      const updated = { ...current, ...partial };
      this.saveUser(updated);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    if (!user?.perfis) return false;
    return user.perfis.some((p) => String(p).toUpperCase() === 'ADMIN' || String(p) === '1');
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private saveTokenType(tokenType: string): void {
    localStorage.setItem(this.tokenTypeKey, tokenType || 'Bearer');
  }
}
