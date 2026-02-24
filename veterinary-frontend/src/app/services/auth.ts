import { Injectable } from '@angular/core';

export interface AuthResponseMock {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_ACCESS = 'accessToken';
  private readonly STORAGE_REFRESH = 'refreshToken';
  private readonly STORAGE_ROLES = 'roles';
  private readonly STORAGE_USERNAME = 'username';
  private readonly STORAGE_VET_ID = 'veterinarianId';

  private readonly users = [
    { username: 'admin', password: 'admin123', roles: ['ADMIN'] },
    { username: 'veter', password: 'veter123', roles: ['VETERINARIO'], veterinarianId: 1 },
    { username: 'cliente', password: 'cliente123', roles: ['CLIENTE'] },
  ];

  private hasLocalStorage(): boolean {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  login(username: string, password: string): AuthResponseMock | null {
    const user = this.users.find((u) => u.username === username && u.password === password);
    if (user === undefined) {
      return null;
    }

    const mock: AuthResponseMock = {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-front-' + user.username,
      refreshToken: 'refresh_token_mock_' + user.username,
      expiresIn: 3600000,
      roles: user.roles,
    };

    this.persistAuth(mock, user);
    return mock;
  }

  private persistAuth(
    data: AuthResponseMock,
    user: { username: string; roles: string[]; veterinarianId?: number },
  ): void {
    if (this.hasLocalStorage() === false) {
      return;
    }
    localStorage.setItem(this.STORAGE_ACCESS, data.accessToken);
    localStorage.setItem(this.STORAGE_REFRESH, data.refreshToken);
    localStorage.setItem(this.STORAGE_ROLES, JSON.stringify(data.roles));
    localStorage.setItem(this.STORAGE_USERNAME, user.username);

    if (user.veterinarianId === undefined) {
      localStorage.removeItem(this.STORAGE_VET_ID);
      return;
    }

    localStorage.setItem(this.STORAGE_VET_ID, String(user.veterinarianId));
  }

  getAccessToken(): string | null {
    if (this.hasLocalStorage() === false) {
      return null;
    }
    return localStorage.getItem(this.STORAGE_ACCESS);
  }

  getRoles(): string[] {
    if (this.hasLocalStorage() === false) {
      return [];
    }
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

  isAdmin(): boolean {
    return this.getRoles().includes('ADMIN');
  }

  isVeterinario(): boolean {
    return this.getRoles().includes('VETERINARIO');
  }

  isCliente(): boolean {
    return this.getRoles().includes('CLIENTE');
  }

  getCurrentUsername(): string | null {
    if (this.hasLocalStorage() === false) {
      return null;
    }
    return localStorage.getItem(this.STORAGE_USERNAME);
  }

  getCurrentVeterinarianId(): number | null {
    if (this.hasLocalStorage() === false) {
      return null;
    }
    const raw = localStorage.getItem(this.STORAGE_VET_ID);
    if (raw === null) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }

  logout(): void {
    if (this.hasLocalStorage() === false) {
      return;
    }
    localStorage.removeItem(this.STORAGE_ACCESS);
    localStorage.removeItem(this.STORAGE_REFRESH);
    localStorage.removeItem(this.STORAGE_ROLES);
    localStorage.removeItem(this.STORAGE_USERNAME);
    localStorage.removeItem(this.STORAGE_VET_ID);
  }
}
