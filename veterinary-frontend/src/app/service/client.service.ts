import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Client } from '../models/client.model';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private API = `${API_BASE_URL}/client-service/clients`;

  constructor(private http: HttpClient) {}

  getClients(name?: string, dni?: string, email?: string, page = 0, size = 10)
    : Observable<ApiResponse<Client[]>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (name) params = params.set('name', name);
    if (dni) params = params.set('dni', dni);
    if (email) params = params.set('email', email);

    return this.http.get<ApiResponse<Client[]>>(this.API, { params });
  }

  count(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API}/count`);
  }

  getById(id: number): Observable<ApiResponse<Client>> {
    return this.http.get<ApiResponse<Client>>(`${this.API}/${id}`);
  }

  update(id: number, client: Partial<Client>)
    : Observable<ApiResponse<Client>> {

    return this.http.put<ApiResponse<Client>>(
      `${this.API}/${id}`, client);
  }

  toggle(id: number, enabled: boolean)
    : Observable<ApiResponse<void>> {

    return this.http.patch<ApiResponse<void>>(
      `${this.API}/${id}/status`,
      null,
      { params: { enabled } }
    );
  }

}
