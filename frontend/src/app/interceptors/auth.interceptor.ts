import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../components/toast/toast.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) =>
{
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const token = authService.token();

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err: unknown) =>
    {
      if (err instanceof HttpErrorResponse)
      {
        if (err.status === 401)
        {
          const isLoginRequest = err.url?.includes('/auth/login') || err.url?.includes('/auth/signup');
          if (!isLoginRequest)
          {
            toast.show('Sessione scaduta. Effettua di nuovo il login.', 'warning');
            authService.logout();
            router.navigate(['/login']);
          }
        }
      }
      return throwError(() => err);
    }),
  );
};
