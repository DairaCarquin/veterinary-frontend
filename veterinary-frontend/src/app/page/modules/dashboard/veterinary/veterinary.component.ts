import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { Appointment, AppointmentService } from '../../../../service/appointment.service';
import { MedicalCase, MedicalHistoryService } from '../../../../service/medical-history.service';

interface CalendarDay {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  totalAppointments: number;
}

@Component({
  selector: 'app-veterinary-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIcon],
  templateUrl: './veterinary.component.html',
  styleUrl: './veterinary.component.css'
})
export class VeterinaryComponent implements OnInit {
  appointments: Appointment[] = [];
  medicalCases: MedicalCase[] = [];
  loading = true;
  currentMonth = this.startOfMonth(new Date());
  selectedDateIso = this.toIsoDate(new Date());
  filters = {
    petId: '',
    clientId: '',
    hour: ''
  };

  stats = {
    total: 0,
    pending: 0,
    inProgress: 0,
    attended: 0,
  };

  ngOnInit(): void {
    this.loadAppointments();
    this.loadMedicalCases();
  }

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly medicalHistoryService: MedicalHistoryService
  ) { }

  get calendarDays(): CalendarDay[] {
    const start = new Date(this.currentMonth);
    start.setDate(1 - start.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const iso = this.toIsoDate(date);

      return {
        date,
        iso,
        inCurrentMonth: date.getMonth() === this.currentMonth.getMonth(),
        isToday: iso === this.toIsoDate(new Date()),
        isSelected: iso === this.selectedDateIso,
        totalAppointments: this.appointments.filter(appointment => this.toIsoDate(new Date(appointment.appointmentDate)) === iso).length
      };
    });
  }

  get selectedDayAppointments(): Appointment[] {
    return this.appointments
      .filter(appointment => this.toIsoDate(new Date(appointment.appointmentDate)) === this.selectedDateIso)
      .filter(appointment => !this.filters.petId || String(appointment.petId).includes(this.filters.petId.trim()))
      .filter(appointment => !this.filters.clientId || String(appointment.clientId).includes(this.filters.clientId.trim()))
      .filter(appointment => !this.filters.hour || this.formatHour(appointment.appointmentDate).includes(this.filters.hour.trim()))
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }

  get monthLabel(): string {
    return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(this.currentMonth);
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  selectDay(iso: string) {
    this.selectedDateIso = iso;
  }

  private loadAppointments(): void {
    this.appointmentService.getAppointments(undefined, undefined, undefined, undefined, 0, 200)
      .subscribe({
        next: (response) => {
          this.appointments = response.data;
          this.stats.total = response.total;
          this.stats.pending = this.countByStatus('PENDING') + this.countByStatus('RESCHEDULED');
          this.stats.inProgress = this.countByStatus('IN_PROGRESS');
          this.stats.attended = this.countByStatus('ATTENDED') + this.countByStatus('PAID');
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private loadMedicalCases(): void {
    this.medicalHistoryService.getMedicalCases(undefined, undefined, undefined, 0, 8)
      .subscribe({
        next: (response) => {
          this.medicalCases = response.data;
        }
      });
  }

  private countByStatus(status: string): number {
    return this.appointments.filter((appointment) => appointment.status === status).length;
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatHour(value: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(value));
  }
}
