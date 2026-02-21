export type AppointmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';

export interface Appointment {
  id: number;
  veterinarianId: number;
  clientName: string;
  petName: string;
  date: string; // ISO date string
  time: string; // HH:mm
  reason: string;
  status: AppointmentStatus;
}
