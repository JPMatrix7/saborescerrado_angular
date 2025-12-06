import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

const buildReturnUrl = (segments: readonly any[]): string => {
  const path = segments.map((s) => s.path).join('/');
  return `/${path}`;
};

export const authGuard: CanMatchFn = (_route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], {
    queryParams: { returnUrl: buildReturnUrl(segments) }
  });
  return false;
};

export const adminGuard: CanMatchFn = (_route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();
  const isAdmin = authService.isAdmin();
  
  console.log('AdminGuard - Verificando acesso');
  console.log('Usuário:', user);
  console.log('Perfis:', user?.perfis);
  console.log('É admin?', isAdmin);

  if (isAdmin) {
    console.log('AdminGuard - Acesso permitido');
    return true;
  }

  console.log('AdminGuard - Acesso negado, redirecionando para login');
  const returnUrl = buildReturnUrl(segments);
  router.navigate(['/login'], {
    queryParams: { returnUrl }
  });
  return false;
};
