import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
  size: number;
}

export interface MedicalCase {
  id: number;
  appointmentId: number;
  petId: number;
  clientId: number;
  veterinarianId: number;
  createdAt: string;
}

export interface Analysis {
  id: number;
  medicalCaseId: number;
  petId: number;
  veterinarianId: number;
  description: string;
  result: string;
  createdAt: string;
}

export interface Diagnosis {
  id: number;
  medicalCaseId: number;
  petId: number;
  veterinarianId: number;
  diagnosis: string;
  observations: string;
  createdAt: string;
}

export interface Referral {
  id: number;
  medicalCaseId: number;
  petId: number;
  veterinarianId: number;
  referredTo: string;
  reason: string;
  createdAt: string;
}

export interface Treatment {
  id: number;
  medicalCaseId: number;
  petId: number;
  veterinarianId: number;
  treatment: string;
  indications: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class MedicalHistoryService {

  private API = 'http://localhost:8090/medical-history-service/medical-events';

  constructor(private http: HttpClient) { }

  getMedicalCases(
    appointmentId?: number,
    petId?: number,
    veterinarianId?: number,
    page = 0,
    size = 10
  ): Observable<ApiResponse<MedicalCase[]>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (appointmentId) params = params.set('appointmentId', appointmentId);
    if (petId) params = params.set('petId', petId);
    if (veterinarianId) params = params.set('veterinarianId', veterinarianId);

    return this.http.get<ApiResponse<MedicalCase[]>>(this.API, { params });
  }

  getAnalysis(caseId?: number, petId?: number, vetId?: number, page = 0, size = 10) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (caseId) params = params.set('medicalCaseId', caseId);
    if (petId) params = params.set('petId', petId);
    if (vetId) params = params.set('veterinarianId', vetId);

    return this.http.get<ApiResponse<Analysis[]>>(`${this.API}/analysis`, { params });
  }

  createAnalysis(data: Partial<Analysis>) {
    return this.http.post<Analysis>(`${this.API}/analysis`, data);
  }

  updateAnalysis(id: number, data: Partial<Analysis>) {
    return this.http.put<Analysis>(`${this.API}/analysis/${id}`, data);
  }

  getDiagnosis(caseId?: number, petId?: number, vetId?: number, page = 0, size = 10) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (caseId) params = params.set('medicalCaseId', caseId);
    if (petId) params = params.set('petId', petId);
    if (vetId) params = params.set('veterinarianId', vetId);

    return this.http.get<ApiResponse<Diagnosis[]>>(`${this.API}/diagnosis`, { params });
  }

  createDiagnosis(data: Partial<Diagnosis>) {
    return this.http.post<Diagnosis>(`${this.API}/diagnosis`, data);
  }

  updateDiagnosis(id: number, data: Partial<Diagnosis>) {
    return this.http.put<Diagnosis>(`${this.API}/diagnosis/${id}`, data);
  }

  getReferral(caseId?: number, petId?: number, vetId?: number, page = 0, size = 10) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (caseId) params = params.set('medicalCaseId', caseId);
    if (petId) params = params.set('petId', petId);
    if (vetId) params = params.set('veterinarianId', vetId);

    return this.http.get<ApiResponse<Referral[]>>(`${this.API}/referral`, { params });
  }

  createReferral(data: Partial<Referral>) {
    return this.http.post<Referral>(`${this.API}/referral`, data);
  }

  updateReferral(id: number, data: Partial<Referral>) {
    return this.http.put<Referral>(`${this.API}/referral/${id}`, data);
  }
  getTreatment(caseId?: number, petId?: number, vetId?: number, page = 0, size = 10) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (caseId) params = params.set('medicalCaseId', caseId);
    if (petId) params = params.set('petId', petId);
    if (vetId) params = params.set('veterinarianId', vetId);

    return this.http.get<ApiResponse<Treatment[]>>(`${this.API}/treatment`, { params });
  }

  createTreatment(data: Partial<Treatment>) {
    return this.http.post<Treatment>(`${this.API}/treatment`, data);
  }

  updateTreatment(id: number, data: Partial<Treatment>) {
    return this.http.put<Treatment>(`${this.API}/treatment/${id}`, data);
  }
}
