import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AdminAuthService } from '../services/admin-auth.service';

/** Same shape as the customer app's authInterceptor — attach the token, refresh once on 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AdminAuthService);

  if (!req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }

  const isAuthEndpoint = req.url.includes('/api/v1/auth/');
  const authedReq = withBearerToken(req, auth.getAccessToken());

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      return auth.refreshSession().pipe(
        switchMap(() => next(withBearerToken(req, auth.getAccessToken()))),
        catchError((refreshError: unknown) => {
          auth.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};

function withBearerToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}
