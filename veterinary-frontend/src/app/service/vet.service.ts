import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Veterinarian {
  id: number;
  userId: number;
  name: string;
  specialty: string;
  licenseNumber: string;
  email: string;
  available: boolean;
  enabled: boolean;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class VetService {

  private API = 'http://localhost:8090/vet-service/vets';

  constructor(private http: HttpClient) { }

  getVets(name?: string, specialty?: string, available?: boolean, page = 0, size = 10)
    : Observable<ApiResponse<Veterinarian[]>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (name) params = params.set('name', name);
    if (specialty) params = params.set('specialty', specialty);
    if (available !== undefined) params = params.set('available', available);

    return this.http.get<ApiResponse<Veterinarian[]>>(this.API, { params });
  }

  update(userId: number, payload: any) {
    return this.http.put<Veterinarian>(`${this.API}/${userId}`, payload);
  }

  toggle(id: number, enabled: boolean) {
    return this.http.patch<void>(
      `${this.API}/${id}/status`,
      null,
      { params: { enabled } }
    );
  }

  getAvailable(): Observable<Veterinarian[]> {
    return this.http.get<Veterinarian[]>(`${this.API}/available`);
  }
}
