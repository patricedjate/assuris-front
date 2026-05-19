import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const withBearer = (token: string) =>
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  const isAuthEndpoint = req.url.includes('/auth/');
  const token = authService.getAccessToken();
  const authReq = token && !isAuthEndpoint ? withBearer(token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        return authService.refresh().pipe(
          switchMap((res) => next(withBearer(res.accessToken))),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
