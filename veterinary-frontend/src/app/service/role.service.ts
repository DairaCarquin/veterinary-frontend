import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Role {
  id: number;
  name: string;
  enabled: boolean;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class RoleService {

  private API = 'http://localhost:8090/auth-service/roles';

  constructor(private http: HttpClient) { }

  getRoles(name?: string, page = 0, size = 10)
    : Observable<ApiResponse<Role[]>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (name) params = params.set('name', name);

    return this.http.get<ApiResponse<Role[]>>(this.API, { params });
  }

  create(role: Partial<Role>) {
    return this.http.post<Role>(this.API, role);
  }

  update(id: number, role: Partial<Role>) {
    return this.http.put<Role>(`${this.API}/${id}`, role);
  }

  toggle(id: number, enabled: boolean) {
    return this.http.patch<void>(
      `${this.API}/${id}/status`,
      null,
      { params: { enabled } }
    );
  }
}
