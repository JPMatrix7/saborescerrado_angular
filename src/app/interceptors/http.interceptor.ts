import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, retry, throwError } from 'rxjs';
import { AuthService } from '@services/auth.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Preserva headers existentes e acrescenta os obrigatórios
  let headers = req.headers.set('Accept', 'application/json');

  // Não adiciona Authorization em rotas de autenticação pública
  const isAuthRoute = req.url.includes('/auth/login') || 
                      req.url.includes('/usuario') && req.method === 'POST' ||
                      req.url.includes('/pessoajuridica') && req.method === 'POST';

  const authHeader = authService.getAuthHeaderValue();
  if (authHeader && !isAuthRoute) {
    headers = headers.set('Authorization', authHeader);
  }

  const needsContentType = req.method !== 'GET' && req.method !== 'DELETE' && req.body;
  if (needsContentType && !req.headers.has('Content-Type')) {
    headers = headers.set('Content-Type', 'application/json');
  }

  const modifiedReq = req.clone({ headers });

  console.log(`[HTTP] ${req.method} ${req.url}`, isAuthRoute ? '(sem auth)' : '');

  return next(modifiedReq).pipe(
    retry({
      count: 2,
      delay: (error: HttpErrorResponse) => {
        if (error.status >= 500) {
          console.warn(`Erro ${error.status} - Tentando novamente...`);
          return throwError(() => error);
        }
        return throwError(() => error);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erro: ${error.error.message}`;
        console.error('Erro no cliente:', error.error.message);
      } else {
        switch (error.status) {
          case 401:
            authService.logout();
            router.navigate(['/login']);
            errorMessage = 'Sessão expirada. Faça login novamente.';
            console.error('Erro 401 - Unauthorized:', error.url);
            break;
          case 400:
            errorMessage =
              error.error?.message || 'Requisição inválida. Verifique os dados enviados.';
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
            errorMessage =
              'Não foi possível conectar ao servidor. Verifique se a API está rodando e se o CORS está habilitado.';
            console.error('Erro de conexão - possível problema de CORS ou servidor offline');
            break;
          default:
            errorMessage = `Erro ${error.status}: ${error.message}`;
            console.error(`Erro HTTP ${error.status}:`, error);
        }
      }

      (error as any).friendlyMessage = errorMessage;
      return throwError(() => error);
    })
  );
};
