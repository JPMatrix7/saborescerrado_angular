import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, retry } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  // Adiciona headers apenas quando necessário
  let headers: { [key: string]: string } = {
    Accept: 'application/json'
  };

  // Inclui Authorization quando existir token salvo
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Só adiciona Content-Type para requisições com body (POST, PUT, PATCH)
  if (req.method !== 'GET' && req.method !== 'DELETE' && req.body) {
    headers['Content-Type'] = 'application/json';
  }

  const modifiedReq = req.clone({ setHeaders: headers });

  console.log(`[HTTP] ${req.method} ${req.url}`);

  return next(modifiedReq).pipe(
    // Retry automático para erros 5xx (máximo 2 tentativas)
    retry({
      count: 2,
      delay: (error: HttpErrorResponse) => {
        // Só faz retry para erros 500+
        if (error.status >= 500) {
          console.warn(`Erro ${error.status} - Tentando novamente...`);
          return throwError(() => error);
        }
        return throwError(() => error);
      }
    }),
    // Tratamento de erros
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
        console.error('Erro no cliente:', error.error.message);
      } else {
        // Erro do lado do servidor
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Requisição inválida. Verifique os dados enviados.';
            console.error('Erro 400 - Bad Request:', error.error);
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            console.error('Erro 404 - Not Found:', error.url);
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            console.error('Erro 500 - Internal Server Error:', error);
            console.error('Stack trace:', error.error);
            break;
          case 0:
            errorMessage = 'Não foi possível conectar ao servidor. Verifique se a API está rodando e se o CORS está habilitado.';
            console.error('Erro de conexão - possível problema de CORS ou servidor offline');
            break;
          default:
            errorMessage = `Erro ${error.status}: ${error.message}`;
            console.error(`Erro HTTP ${error.status}:`, error);
        }
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
