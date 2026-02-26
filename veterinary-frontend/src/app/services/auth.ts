import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, throwError } from 'rxjs';
import { environment } from '../../environments';

export interface AuthResponseApi {
  id: number;
  username: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  status: number;
  description: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_ACCESS = 'accessToken';
  private readonly STORAGE_REFRESH = 'refreshToken';
  private readonly STORAGE_ROLES = 'roles';
  private readonly STORAGE_USERNAME = 'username';
  private readonly STORAGE_USER_ID = 'userId';
  private readonly STORAGE_VET_ID = 'veterinarianId';

  private readonly mockUsers: {
    username: string;
    password: string;
    role: string;
    veterinarianId?: number;
  }[] = [
    { username: 'admin', password: 'admin123', role: 'ADMIN' },
    { username: 'veter', password: 'veter123', role: 'VETERINARY', veterinarianId: 1 },
    { username: 'cliente', password: 'cliente123', role: 'CLIENT' },
  ];

  constructor(private readonly http: HttpClient) {}

  private hasLocalStorage(): boolean {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  login(username: string, password: string): Observable<AuthResponseApi> {
    if (environment.useMockBackend) {
      const user = this.mockUsers.find((u) => u.username === username && u.password === password);
      if (user) {
        const now = Date.now();
        const data: AuthResponseApi = {
          id: now,
          username: user.username,
          role: user.role,
          accessToken: `mock-token-${user.username}-${now}`,
          refreshToken: `mock-refresh-${user.username}-${now}`,
        };

        this.persistAuth(data, [user.role]);

        if (this.hasLocalStorage()) {
          if (user.veterinarianId === undefined) {
            localStorage.removeItem(this.STORAGE_VET_ID);
          } else {
            localStorage.setItem(this.STORAGE_VET_ID, String(user.veterinarianId));
          }
        }

        return of(data);
      }

      return throwError(() => new Error('Credenciales inválidas (mock)'));
    }

    const url = `${environment.apiBaseUrl}/auth-service/auth/login`;

    return this.http.post<ApiResponse<AuthResponseApi>>(url, { username, password }).pipe(
      map((response) => {
        const data = response.data;

        const roles = data.role ? [data.role] : [];
        this.persistAuth(data, roles);

        return data;
      }),
    );
  }

  private persistAuth(data: AuthResponseApi, roles: string[]): void {
    if (this.hasLocalStorage()) {
      localStorage.setItem(this.STORAGE_ACCESS, data.accessToken);
      localStorage.setItem(this.STORAGE_REFRESH, data.refreshToken);
      localStorage.setItem(this.STORAGE_ROLES, JSON.stringify(roles));
      localStorage.setItem(this.STORAGE_USERNAME, data.username);
      localStorage.setItem(this.STORAGE_USER_ID, String(data.id));
    }
  }

  getAccessToken(): string | null {
    if (this.hasLocalStorage()) {
      return localStorage.getItem(this.STORAGE_ACCESS);
    }
    return null;
  }

  getRoles(): string[] {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(this.STORAGE_ROLES);
      if (raw === null) {
        return [];
      }
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    return [];
  }

  isAdmin(): boolean {
    return this.getRoles().includes('ADMIN');
  }

  isVeterinario(): boolean {
    return this.getRoles().some((r) => {
      const upper = r.toUpperCase();
      return upper === 'VETERINARIO' || upper === 'VETERINARY';
    });
  }

  isCliente(): boolean {
    return this.getRoles().some((r) => {
      const upper = r.toUpperCase();
      return upper === 'CLIENT' || upper === 'CLIENTE';
    });
  }

  getCurrentUsername(): string | null {
    if (this.hasLocalStorage()) {
      return localStorage.getItem(this.STORAGE_USERNAME);
    }
    return null;
  }

  getCurrentUserId(): number | null {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(this.STORAGE_USER_ID);
      if (raw === null) {
        return null;
      }
      const parsed = Number(raw);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  getCurrentVeterinarianId(): number | null {
    if (this.hasLocalStorage()) {
      const raw = localStorage.getItem(this.STORAGE_VET_ID);
      if (raw === null) {
        return null;
      }
      const parsed = Number(raw);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  logout(): void {
    if (this.hasLocalStorage()) {
      localStorage.removeItem(this.STORAGE_ACCESS);
      localStorage.removeItem(this.STORAGE_REFRESH);
      localStorage.removeItem(this.STORAGE_ROLES);
      localStorage.removeItem(this.STORAGE_USERNAME);
      localStorage.removeItem(this.STORAGE_USER_ID);
      localStorage.removeItem(this.STORAGE_VET_ID);
    }
  }
}
