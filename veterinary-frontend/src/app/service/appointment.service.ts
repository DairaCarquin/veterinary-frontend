import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Appointment {
  id: number;
  petId: number;
  clientId: number;
  veterinarianId: number;
  appointmentDate: string;
  reason: string;
  status: string;
  enabled: boolean;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private API = 'http://localhost:8090/appointment-service/appointments';

  constructor(private http: HttpClient) { }

  getAppointments(
    petId?: number,
    veterinarianId?: number,
    status?: string,
    date?: string,
    page = 0,
    size = 10
  ): Observable<ApiResponse<Appointment[]>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (petId) params = params.set('petId', petId);
    if (veterinarianId) params = params.set('veterinarianId', veterinarianId);
    if (status) params = params.set('status', status);
    if (date) params = params.set('date', date);

    return this.http.get<ApiResponse<Appointment[]>>(this.API, { params });
  }

  create(payload: Partial<Appointment>) {
    return this.http.post<Appointment>(this.API, payload);
  }

  updateStatus(id: number, status: string) {
    return this.http.put<Appointment>(
      `${this.API}/${id}/status`,
      { status }
    );
  }

  reschedule(id: number, newDate: string, newVetId?: number) {
    return this.http.put<Appointment>(
      `${this.API}/${id}/reschedule`,
      {
        newDate,
        newVeterinarianId: newVetId
      }
    );
  }

  toggle(id: number, enabled: boolean) {
    return this.http.patch<void>(
      `${this.API}/${id}/status`,
      null,
      { params: { enabled } }
    );
  }
}
