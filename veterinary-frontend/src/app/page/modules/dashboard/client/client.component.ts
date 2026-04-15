import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Appointment, AppointmentService } from '../../../../service/appointment.service';
import { Pet, PetService } from '../../../../service/pet.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit {
  appointments: Appointment[] = [];
  pets: Pet[] = [];
  loading = true;

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly petService: PetService,
  ) { }

  ngOnInit(): void {
    this.loadAppointments();
    this.loadPets();
  }

  private loadAppointments(): void {
    this.appointmentService.getAppointments(undefined, undefined, undefined, undefined, 0, 10)
      .subscribe({
        next: (response) => {
          this.appointments = response.data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private loadPets(): void {
    this.petService.getPets(undefined, undefined, undefined, 0, 10)
      .subscribe({
        next: (response) => {
          this.pets = response.data;
        }
      });
  }
}
