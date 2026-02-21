import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Veterinary } from '../../models/veterinary.model';
import { VeterinaryService } from '../../services/veterinary.service';
import { AuthService } from '../../services/auth';
import { Appointment } from '../../models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veterinario.html',
  styleUrl: './veterinario.css',
})
export class Veterinario implements OnInit {
  @ViewChild('perfilSection')
  private readonly perfilSection?: ElementRef<HTMLElement>;

  @ViewChild('citasSection')
  private readonly citasSection?: ElementRef<HTMLElement>;

  veterinarioActual: Veterinary | null = null;

  // Modelo editable para el formulario (no se edita email ni user_id)
  formModel = {
    name: '',
    lastname: '',
    phone: '',
    specialty: '',
  };

  // Métricas de ejemplo (puedes adaptarlas a tus datos reales)
  consultasHoy = 12;
  porcentajeDisponibilidad = 0;

  // Datos del gráfico (mock visual)
  meses = ['Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  valores = [4, 6, 5, 7];

  // Citas mock
  citas: Appointment[] = [];
  filtroEstado: 'TODAS' | 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' = 'TODAS';

  mensajeExito = '';
  mensajeError = '';

  constructor(
    private readonly veterinaryService: VeterinaryService,
    private readonly authService: AuthService,
    private readonly appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  private cargarPerfil(): void {
    const vetId = this.authService.getCurrentVeterinarianId() ?? 1;

    this.veterinaryService.getVeterinarianById(vetId).subscribe((vet) => {
      if (!vet) {
        this.mensajeError = 'No se encontró el perfil del veterinario en el mock.';
        return;
      }

      this.veterinarioActual = vet;
      this.formModel = {
        name: vet.name,
        lastname: vet.lastname,
        phone: vet.phone,
        specialty: vet.specialty,
      };
      this.porcentajeDisponibilidad = vet.available ? 100 : 0;

      this.cargarCitas(vet.id);
    });
  }

  private cargarCitas(veterinarianId: number): void {
    this.appointmentService.getAppointmentsForVeterinarian(veterinarianId).subscribe((citas) => {
      this.citas = citas;
    });
  }

  guardarCambios(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.veterinarioActual) {
      this.mensajeError = 'No hay perfil cargado.';
      return;
    }

    const id = this.veterinarioActual.id;

    this.veterinaryService
      .updateVeterinarian(id, {
        name: this.formModel.name,
        lastname: this.formModel.lastname,
        phone: this.formModel.phone,
        specialty: this.formModel.specialty,
      })
      .subscribe((updated) => {
        if (!updated) {
          this.mensajeError = 'Error al actualizar el perfil en el mock.';
          return;
        }

        this.veterinarioActual = updated;
        this.mensajeExito = 'Perfil actualizado correctamente.';
      });
  }

  toggleDisponibilidad(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.veterinarioActual) {
      this.mensajeError = 'No hay perfil cargado.';
      return;
    }

    const id = this.veterinarioActual.id;
    const nuevoEstado = !this.veterinarioActual.available;

    this.veterinaryService.updateAvailability(id, nuevoEstado).subscribe((updated) => {
      if (!updated) {
        this.mensajeError = 'No se pudo actualizar la disponibilidad en el mock.';
        return;
      }

      this.veterinarioActual = updated;
      this.porcentajeDisponibilidad = updated.available ? 100 : 0;
      this.mensajeExito = 'Disponibilidad actualizada.';
    });
  }

  get badgeDisponibilidadClass(): string {
    if (!this.veterinarioActual) {
      return 'badge-secondary';
    }
    return this.veterinarioActual.available ? 'badge-core' : 'badge-overdue';
  }

  get totalPacientesMes(): number {
    return this.valores.reduce((acumulado, valor) => acumulado + valor, 0);
  }

  irAMiPerfil(): void {
    if (!this.perfilSection) {
      return;
    }
    this.perfilSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  irAMisCitas(): void {
    if (!this.citasSection) {
      return;
    }
    this.citasSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  citasFiltradas(): Appointment[] {
    if (this.filtroEstado === 'TODAS') {
      return this.citas;
    }
    return this.citas.filter((cita) => cita.status === this.filtroEstado);
  }

  cancelarCita(id: number): void {
    this.appointmentService.updateStatus(id, 'CANCELADA').subscribe((updated) => {
      if (!updated) {
        this.mensajeError = 'No se pudo cancelar la cita (mock).';
        return;
      }
      this.mensajeExito = 'Cita cancelada (mock).';
      if (this.veterinarioActual) {
        this.cargarCitas(this.veterinarioActual.id);
      }
    });
  }
}
