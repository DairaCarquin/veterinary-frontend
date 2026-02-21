import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CreateVeterinaryDto, UpdateVeterinaryDto, Veterinary } from '../models/veterinary.model';

const mockVeterinarians: Veterinary[] = [
  {
    id: 1,
    user_id: 100,
    name: 'Juan',
    lastname: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '999999999',
    specialty: 'Cirugía',
    available: true,
    created_at: '2026-02-19T23:45:00Z',
    updated_at: '2026-02-20T10:30:00Z',
    status: 1,
  },
  {
    id: 2,
    user_id: 101,
    name: 'María',
    lastname: 'García',
    email: 'maria.garcia@example.com',
    phone: '888888888',
    specialty: 'Medicina General',
    available: false,
    created_at: '2026-02-19T23:46:00Z',
    updated_at: null,
    status: 1,
  },
  {
    id: 3,
    user_id: 102,
    name: 'Carlos',
    lastname: 'López',
    email: 'carlos.lopez@example.com',
    phone: '777777777',
    specialty: 'Dermatología',
    available: true,
    created_at: '2026-02-18T15:20:00Z',
    updated_at: '2026-02-20T08:15:00Z',
    status: 1,
  },
  {
    id: 4,
    user_id: 103,
    name: 'Ana',
    lastname: 'Martínez',
    email: 'ana.martinez@example.com',
    phone: '666666666',
    specialty: 'Oftalmología',
    available: false,
    created_at: '2026-02-17T09:00:00Z',
    updated_at: null,
    status: 1,
  },
  {
    id: 5,
    user_id: 104,
    name: 'Luis',
    lastname: 'Rodríguez',
    email: 'luis.rodriguez@example.com',
    phone: '555555555',
    specialty: 'Cardiología',
    available: true,
    created_at: '2026-02-16T11:45:00Z',
    updated_at: '2026-02-20T09:30:00Z',
    status: 1,
  },
];

@Injectable({
  providedIn: 'root',
})
export class VeterinaryService {
  private readonly veterinarians$ = new BehaviorSubject<Veterinary[]>([...mockVeterinarians]);

  getVeterinarians(): Observable<Veterinary[]> {
    return this.veterinarians$.asObservable();
  }

  getVeterinarianById(id: number): Observable<Veterinary | undefined> {
    const current = this.veterinarians$.value;
    return of(current.find((v) => v.id === id));
  }

  getAvailableVeterinarians(): Observable<Veterinary[]> {
    const current = this.veterinarians$.value.filter((v) => v.available && v.status === 1);
    return of(current);
  }

  createVeterinarian(dto: CreateVeterinaryDto): Observable<Veterinary> {
    const current = this.veterinarians$.value;
    const newId = current.length ? Math.max(...current.map((v) => v.id)) + 1 : 1;

    const now = new Date().toISOString();
    const created: Veterinary = {
      id: newId,
      user_id: 100 + newId,
      name: dto.name,
      lastname: dto.lastname,
      email: dto.email,
      phone: dto.phone ?? '',
      specialty: dto.specialty,
      available: false,
      created_at: now,
      updated_at: null,
      status: 1,
    };

    this.veterinarians$.next([...current, created]);
    return of(created);
  }

  updateVeterinarian(id: number, dto: UpdateVeterinaryDto): Observable<Veterinary | undefined> {
    const current = this.veterinarians$.value;
    const index = current.findIndex((v) => v.id === id);
    if (index === -1) {
      return of(undefined);
    }

    const updated: Veterinary = {
      ...current[index],
      ...dto,
      updated_at: new Date().toISOString(),
    };

    const copy = [...current];
    copy[index] = updated;
    this.veterinarians$.next(copy);
    return of(updated);
  }

  deleteVeterinarian(id: number): Observable<boolean> {
    const current = this.veterinarians$.value;
    const index = current.findIndex((v) => v.id === id);
    if (index === -1) {
      return of(false);
    }

    const copy = [...current];
    const vet = copy[index];
    copy[index] = {
      ...vet,
      status: 0,
      available: false,
      updated_at: new Date().toISOString(),
    };

    this.veterinarians$.next(copy);
    return of(true);
  }

  updateAvailability(id: number, available: boolean): Observable<Veterinary | undefined> {
    const current = this.veterinarians$.value;
    const index = current.findIndex((v) => v.id === id);
    if (index === -1) {
      return of(undefined);
    }

    const updated: Veterinary = {
      ...current[index],
      available,
      updated_at: new Date().toISOString(),
    };

    const copy = [...current];
    copy[index] = updated;
    this.veterinarians$.next(copy);
    return of(updated);
  }
}