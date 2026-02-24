import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Client, ClientServiceResult, CreateClientDto, UpdateClientDto } from '../models/client.model';

const mockClients: Client[] = [
  {
    id: 1,
    user_id: 200,
    name: 'Carlos Ramos',
    email: 'carlos.ramos@example.com',
    dni: '12345678',
    phone: '987654321',
    pet_ids: [1, 2],
    created_at: '2026-02-19T10:00:00Z',
    updated_at: null,
    status: 1,
  },
  {
    id: 2,
    user_id: 201,
    name: 'Lucía Fernández',
    email: 'lucia.fernandez@example.com',
    dni: '87654321',
    phone: '912345678',
    pet_ids: [3],
    created_at: '2026-02-18T16:30:00Z',
    updated_at: '2026-02-20T09:15:00Z',
    status: 1,
  },
  {
    id: 3,
    user_id: 202,
    name: 'Miguel Torres',
    email: 'miguel.torres@example.com',
    dni: '44556677',
    phone: undefined,
    pet_ids: [],
    created_at: '2026-02-17T08:45:00Z',
    updated_at: null,
    status: 0,
  },
];

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly clients$ = new BehaviorSubject<Client[]>([...mockClients]);

  getClients(): Observable<Client[]> {
    return this.clients$.asObservable();
  }

  getClientById(id: number): Observable<Client | undefined> {
    const current = this.clients$.value;
    return of(current.find((c) => c.id === id));
  }

  dniExists(dni: string): boolean {
    const current = this.clients$.value;
    return current.some((c) => c.dni.toLowerCase() === dni.toLowerCase());
  }

  registerClient(dto: CreateClientDto): Observable<ClientServiceResult<Client>> {
    const current = this.clients$.value;

    if (this.dniExists(dto.dni)) {
      return of({ success: false, message: 'El DNI ya está registrado en el mock.' });
    }

    if (current.some((c) => c.email.toLowerCase() === dto.email.toLowerCase())) {
      return of({ success: false, message: 'El email ya está registrado en el mock.' });
    }

    const newId = current.length ? Math.max(...current.map((c) => c.id)) + 1 : 1;
    const now = new Date().toISOString();

    const created: Client = {
      id: newId,
      user_id: 200 + newId,
      name: dto.name,
      email: dto.email,
      dni: dto.dni,
      phone: dto.phone,
      pet_ids: [],
      created_at: now,
      updated_at: null,
      status: 1,
    };

    this.clients$.next([...current, created]);

    return of({
      success: true,
      message: 'Cliente registrado correctamente (mock).',
      data: created,
    });
  }

  updateClient(id: number, dto: UpdateClientDto): Observable<ClientServiceResult<Client>> {
    const current = this.clients$.value;
    const index = current.findIndex((c) => c.id === id);

    if (index === -1) {
      return of({ success: false, message: 'Cliente no encontrado en el mock.' });
    }

    const updated: Client = {
      ...current[index],
      ...dto,
      updated_at: new Date().toISOString(),
    };

    const copy = [...current];
    copy[index] = updated;
    this.clients$.next(copy);

    return of({
      success: true,
      message: 'Cliente actualizado correctamente (mock).',
      data: updated,
    });
  }

  logicalDeleteClient(id: number): Observable<ClientServiceResult<boolean>> {
    const current = this.clients$.value;
    const index = current.findIndex((c) => c.id === id);

    if (index === -1) {
      return of({ success: false, message: 'Cliente no encontrado para borrado lógico (mock).' });
    }

    const copy = [...current];
    const client = copy[index];
    copy[index] = {
      ...client,
      status: 0,
      updated_at: new Date().toISOString(),
    };

    this.clients$.next(copy);

    return of({ success: true, message: 'Cliente desactivado (borrado lógico) en mock.', data: true });
  }

  associatePets(clientId: number, petIds: number[]): Observable<ClientServiceResult<Client>> {
    const current = this.clients$.value;
    const index = current.findIndex((c) => c.id === clientId);

    if (index === -1) {
      return of({ success: false, message: 'Cliente no encontrado para asociar mascotas (mock).' });
    }

    const updated: Client = {
      ...current[index],
      pet_ids: [...petIds],
      updated_at: new Date().toISOString(),
    };

    const copy = [...current];
    copy[index] = updated;
    this.clients$.next(copy);

    return of({
      success: true,
      message: 'Mascotas asociadas al cliente (mock).',
      data: updated,
    });
  }
}
