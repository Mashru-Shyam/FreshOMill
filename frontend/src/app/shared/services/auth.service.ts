import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface AuthUser {
  email: string;
}

interface StoredAuth {
  email: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface RequestOtpResponse {
  challengeId: string;
  expiresAt: string;
}

interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  email: string;
}

const STORAGE_KEY = 'freshomill_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private stored: StoredAuth | null;

  readonly currentUser = signal<AuthUser | null>(null);

  constructor() {
    this.stored = this.load();
    this.currentUser.set(this.stored ? { email: this.stored.email } : null);
  }

  private load(): StoredAuth | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredAuth) : null;
    } catch {
      return null;
    }
  }

  private save(auth: StoredAuth): void {
    this.stored = auth;
    this.currentUser.set({ email: auth.email });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    }
  }

  private clear(): void {
    this.stored = null;
    this.currentUser.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  getAccessToken(): string | null {
    return this.stored?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.stored?.refreshToken ?? null;
  }

  requestOtp(email: string): Observable<RequestOtpResponse> {
    return this.http.post<RequestOtpResponse>(`${API_BASE_URL}/api/v1/auth/otp/request`, { email });
  }

  verifyOtp(challengeId: string, code: string): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/api/v1/auth/otp/verify`, { challengeId, code })
      .pipe(
        tap((response) => this.save(toStoredAuth(response))),
        map((response): AuthUser => ({ email: response.email }))
      );
  }

  refreshSession(): Observable<AuthUser> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken })
      .pipe(
        tap((response) => this.save(toStoredAuth(response))),
        map((response): AuthUser => ({ email: response.email }))
      );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    this.clear();
    if (refreshToken) {
      this.http.post(`${API_BASE_URL}/api/v1/auth/logout`, { refreshToken }).subscribe({ error: () => undefined });
    }
  }
}

function toStoredAuth(response: AuthResponse): StoredAuth {
  return {
    email: response.email,
    accessToken: response.accessToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    refreshToken: response.refreshToken,
    refreshTokenExpiresAt: response.refreshTokenExpiresAt,
  };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
