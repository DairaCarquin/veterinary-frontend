import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, RegisterUserPayload, User } from './models/user.model';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class UserService {

  private API = `${API_BASE_URL}/auth-service/auth`;

  constructor(private http: HttpClient) {}

  getUsers(username?: string, roleId?: number, page = 0, size = 10)
    : Observable<ApiResponse<User[]>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (username) params = params.set('username', username);
    if (roleId) params = params.set('roleId', roleId);

    return this.http.get<ApiResponse<User[]>>(
      `${this.API}/users`,
      { params }
    );
  }

  update(id: number, user: any)
    : Observable<User> {

    return this.http.put<User>(
      `${this.API}/users/${id}`,
      user
    );
  }

  toggle(id: number, enabled: boolean)
    : Observable<void> {

    return this.http.patch<void>(
      `${this.API}/users/${id}/status`,
      null,
      { params: { enabled } }
    );
  }

  register(payload: RegisterUserPayload) {
    return this.http.post(`${this.API}/register`, payload);
  }
}
