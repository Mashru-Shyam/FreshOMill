import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface AdminUser {
  email: string;
  role: string;
}

interface StoredAuth {
  email: string;
  role: string;
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
  role: string;
}

// Own storage key (not shared with the customer app's `freshomill_auth`) — this is a separate
// origin/app anyway so localStorage is already isolated, but a distinct name keeps intent clear
// if the two are ever inspected side by side.
const STORAGE_KEY = 'freshomill_admin_auth';

/**
 * Same passwordless email-OTP flow as the customer app's AuthService, hitting the exact same
 * /api/v1/auth endpoints — signing in here doesn't require a separate "admin login" backend
 * flow, just an email in the Admin:Emails allow-list (see backend's AdminOptions). The
 * difference is `role` is now part of what's stored/exposed, and `isAdmin` gates the app.
 */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  private stored: StoredAuth | null;

  readonly currentUser = signal<AdminUser | null>(null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  constructor() {
    this.stored = this.load();
    this.currentUser.set(this.stored ? { email: this.stored.email, role: this.stored.role } : null);
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
    this.currentUser.set({ email: auth.email, role: auth.role });
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

  verifyOtp(challengeId: string, code: string): Observable<AdminUser> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/api/v1/auth/otp/verify`, { challengeId, code })
      .pipe(
        tap((response) => this.save(toStoredAuth(response))),
        map((response): AdminUser => ({ email: response.email, role: response.role }))
      );
  }

  refreshSession(): Observable<AdminUser> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken })
      .pipe(
        tap((response) => this.save(toStoredAuth(response))),
        map((response): AdminUser => ({ email: response.email, role: response.role }))
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
    role: response.role,
    accessToken: response.accessToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    refreshToken: response.refreshToken,
    refreshTokenExpiresAt: response.refreshTokenExpiresAt,
  };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
