import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

const mockAppointments: Appointment[] = [
  {
    id: 1,
    veterinarianId: 1,
    clientName: 'Pedro Gómez',
    petName: 'Luna',
    date: '2026-02-21',
    time: '10:00',
    reason: 'Vacunación anual',
    status: 'PENDIENTE',
  },
  {
    id: 2,
    veterinarianId: 1,
    clientName: 'Laura Sánchez',
    petName: 'Max',
    date: '2026-02-21',
    time: '11:30',
    reason: 'Control general',
    status: 'CONFIRMADA',
  },
  {
    id: 3,
    veterinarianId: 1,
    clientName: 'Carlos López',
    petName: 'Michi',
    date: '2026-02-22',
    time: '09:15',
    reason: 'Dermatología',
    status: 'PENDIENTE',
  },
];

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly appointments$ = new BehaviorSubject<Appointment[]>([...mockAppointments]);

  getAppointmentsForVeterinarian(veterinarianId: number): Observable<Appointment[]> {
    const all = this.appointments$.value;
    return of(all.filter((cita) => cita.veterinarianId === veterinarianId));
  }

  updateStatus(id: number, status: AppointmentStatus): Observable<Appointment | undefined> {
    const current = this.appointments$.value;
    const index = current.findIndex((c) => c.id === id);
    if (index === -1) {
      return of(undefined);
    }

    const updated: Appointment = { ...current[index], status };
    const copy = [...current];
    copy[index] = updated;
    this.appointments$.next(copy);

    return of(updated);
  }
}
