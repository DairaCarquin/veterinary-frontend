import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: number;
  ownerId: number;
  enabled: boolean;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class PetService {

  private API = 'http://localhost:8090/pet-service/pets';

  constructor(private http: HttpClient) { }

  getPets(name?: string, species?: string, ownerId?: number, page = 0, size = 10)
    : Observable<ApiResponse<Pet[]>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (name) params = params.set('name', name);
    if (species) params = params.set('species', species);
    if (ownerId) params = params.set('ownerId', ownerId);

    return this.http.get<ApiResponse<Pet[]>>(this.API, { params });
  }

  create(pet: Partial<Pet>) {
    return this.http.post<Pet>(this.API, pet);
  }

  update(id: number, pet: Partial<Pet>) {
    return this.http.put<Pet>(`${this.API}/${id}`, pet);
  }

  toggle(id: number, enabled: boolean) {
    return this.http.patch<void>(
      `${this.API}/${id}/status`,
      null,
      { params: { enabled } }
    );
  }

  activePercentage(): Observable<number> {
    return this.http.get<number>(`${this.API}/stats/active-percentage`);
  }
}
