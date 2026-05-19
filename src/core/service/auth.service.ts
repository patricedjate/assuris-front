import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { AuthResponse, LoginRequest } from '../model/auth';

const KEYS = {
  access:  'access_token',
  refresh: 'refresh_token',
  tenant:  'tenant_id',
  role:    'role',
} as const;

const ROLE_ROUTES: Record<string, string> = {
  SUPER_ADMIN: '/admin-saas',
  ADMIN:       '/admin-tenant',
  AGENT:       '/admin-tenant',
  CLIENT:      '/admin-client',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base   = `${environment.apiUrl}/auth`;

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, credentials).pipe(
      tap((res) => this.storeTokens(res))
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(KEYS.refresh) ?? '';
    return this.http
      .post<AuthResponse>(`${this.base}/refresh`, refreshToken)
      .pipe(tap((res) => this.storeTokens(res)));
  }

  logout(): void {
    localStorage.removeItem(KEYS.access);
    localStorage.removeItem(KEYS.refresh);
    localStorage.removeItem(KEYS.tenant);
    localStorage.removeItem(KEYS.role);
    this.router.navigate(['/']);
  }

  redirectByRole(): void {
    const role = this.getRole() ?? '';
    const route = ROLE_ROUTES[role] ?? '/';
    this.router.navigate([route]);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(KEYS.access);
  }

  getAccessToken(): string | null  { return localStorage.getItem(KEYS.access); }
  getRefreshToken(): string | null { return localStorage.getItem(KEYS.refresh); }
  getTenantId(): string | null     { return localStorage.getItem(KEYS.tenant); }
  getRole(): string | null         { return localStorage.getItem(KEYS.role); }

  private storeTokens(res: AuthResponse): void {
    localStorage.setItem(KEYS.access,  res.accessToken);
    localStorage.setItem(KEYS.refresh, res.refreshToken);
    localStorage.setItem(KEYS.tenant,  res.tenantId);
    localStorage.setItem(KEYS.role,    res.role);
  }
}
