import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export type UserRole = 'ADMIN' | 'CLIENT' | 'VETERINARY';

export interface LoginResponse {
  status: number;
  description: string;
  data: {
    id: number;
    username: string;
    role: UserRole;
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API = 'http://localhost:8090/auth-service/auth/login';

  private readonly STORAGE_ACCESS = 'accessToken';
  private readonly STORAGE_REFRESH = 'refreshToken';
  private readonly STORAGE_ROLE = 'role';
  private readonly STORAGE_USERNAME = 'username';
  private readonly STORAGE_USER_ID = 'userId';

  constructor(private readonly http: HttpClient) { }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.API, { username, password }).pipe(
      tap((response) => {
        const data = response.data;

        localStorage.setItem(this.STORAGE_ACCESS, data.accessToken);
        localStorage.setItem(this.STORAGE_REFRESH, data.refreshToken);
        localStorage.setItem(this.STORAGE_ROLE, data.role);
        localStorage.setItem(this.STORAGE_USERNAME, data.username);
        localStorage.setItem(this.STORAGE_USER_ID, String(data.id));
      }),
    );
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isVeterinario(): boolean {
    return this.getRole() === 'VETERINARY';
  }

  isCliente(): boolean {
    return this.getRole() === 'CLIENT';
  }

  logout(): void {
    localStorage.clear();
  }

  getCurrentUserId(): number | null {
    const raw = localStorage.getItem(this.STORAGE_USER_ID);
    if (!raw) return null;

    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.STORAGE_ACCESS);
    return !!token && token.split('.').length === 3;
  }

  getRole(): UserRole | null {
    const role = localStorage.getItem(this.STORAGE_ROLE);
    if (role === 'ADMIN' || role === 'CLIENT' || role === 'VETERINARY') {
      return role;
    }
    return null;
  }

  getDefaultRoute(): string {
    const role = this.getRole();

    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'VETERINARY':
        return '/veterinario';
      case 'CLIENT':
        return '/cliente';
      default:
        return '/login';
    }
  }
}
