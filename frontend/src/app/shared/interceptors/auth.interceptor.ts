import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';

/**
 * Attaches the access token to every request against our own API, and on a 401 attempts one
 * silent POST /api/v1/auth/refresh + retries the original request. Necessary because access
 * tokens expire in 15 minutes (Jwt:AccessTokenMinutes on the backend) — without this the app
 * would silently stop working every 15 minutes. Auth endpoints themselves are excluded from the
 * retry-on-401 loop so a failed login/refresh can't trigger another refresh attempt.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

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
