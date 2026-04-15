import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Appointment, AppointmentService } from '../../../../service/appointment.service';

@Component({
  selector: 'app-veterinary-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './veterinary.component.html',
  styleUrl: './veterinary.component.css'
})
export class VeterinaryComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;
  stats = {
    total: 0,
    pending: 0,
    attended: 0,
    rescheduled: 0,
  };

  constructor(private readonly appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.appointmentService.getAppointments(undefined, undefined, undefined, undefined, 0, 20)
      .subscribe({
        next: (response) => {
          this.appointments = response.data;
          this.stats.total = response.total;
          this.stats.pending = this.countByStatus('PENDING');
          this.stats.attended = this.countByStatus('ATTENDED');
          this.stats.rescheduled = this.countByStatus('RESCHEDULED');
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private countByStatus(status: string): number {
    return this.appointments.filter((appointment) => appointment.status === status).length;
  }
}
