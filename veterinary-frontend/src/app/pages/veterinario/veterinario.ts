import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Veterinary } from '../../models/veterinary.model';
import { VeterinaryService } from '../../services/veterinary.service';
import { AuthService } from '../../services/auth';
import { Appointment } from '../../models/appointment.model';
import { AppointmentService } from '../../services/appointment.service';

interface Paciente {
  name: string;
  species: string;
  breed: string;
  ownerName: string;
  ownerPhone: string;
}

@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veterinario.html',
  styleUrl: './veterinario.css',
})
export class Veterinario implements OnInit {
  activeSection: 'DASHBOARD' | 'PERFIL' | 'CITAS' | 'PACIENTES' | 'CONFIG' | 'DOCS' = 'PERFIL';

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
  filtroTexto = '';

  // Pacientes mock (podrían venir de un servicio dedicado)
  pacientes: Paciente[] = [
    {
      name: 'Luna',
      species: 'Perro',
      breed: 'Labrador',
      ownerName: 'Pedro Gómez',
      ownerPhone: '987654321',
    },
    {
      name: 'Max',
      species: 'Perro',
      breed: 'Pastor Alemán',
      ownerName: 'Laura Sánchez',
      ownerPhone: '912345678',
    },
    {
      name: 'Michi',
      species: 'Gato',
      breed: 'Siames',
      ownerName: 'Carlos López',
      ownerPhone: '954321987',
    },
  ];

  pacienteBusqueda = '';

  mensajeExito = '';
  mensajeError = '';

  // Preferencias de configuración (mock)
  notifEmail = true;
  notifRecordatorios = true;
  duracionCitaMin = 30;
  horarioManana = {
    inicio: '09:00',
    fin: '13:00',
  };
  horarioTarde = {
    inicio: '16:00',
    fin: '20:00',
  };

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

  get totalCitas(): number {
    return this.citas.length;
  }

  get totalPendientes(): number {
    return this.citas.filter((cita) => cita.status === 'PENDIENTE').length;
  }

  get totalConfirmadas(): number {
    return this.citas.filter((cita) => cita.status === 'CONFIRMADA').length;
  }

  get totalCanceladas(): number {
    return this.citas.filter((cita) => cita.status === 'CANCELADA').length;
  }

  get proximaCita(): Appointment | null {
    if (this.citas.length === 0) {
      return null;
    }

    const ahora = new Date();

    const futuras = this.citas
      .map((cita) => {
        const fechaHora = new Date(`${cita.date}T${cita.time}`);
        return { cita, fechaHora };
      })
      .filter((item) => item.fechaHora >= ahora)
      .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());

    if (futuras.length > 0) {
      return futuras[0].cita;
    }

    // Si no hay futuras, mostramos la primera por orden cronológico como referencia
    const ordenadas = this.citas
      .map((cita) => {
        const fechaHora = new Date(`${cita.date}T${cita.time}`);
        return { cita, fechaHora };
      })
      .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());

    return ordenadas.length > 0 ? ordenadas[0].cita : null;
  }

  get pacientesFiltrados(): Paciente[] {
    const texto = this.pacienteBusqueda.trim().toLowerCase();
    if (texto.length === 0) {
      return this.pacientes;
    }

    return this.pacientes.filter((p) => {
      const nombre = p.name.toLowerCase();
      const raza = p.breed.toLowerCase();
      const dueno = p.ownerName.toLowerCase();
      return nombre.includes(texto) || raza.includes(texto) || dueno.includes(texto);
    });
  }

  irAMiPerfil(): void {
    this.activeSection = 'PERFIL';
  }

  irAMisCitas(): void {
    this.activeSection = 'CITAS';
  }

  irAPacientes(): void {
    this.activeSection = 'PACIENTES';
  }

  irADocumentacion(): void {
    this.activeSection = 'DOCS';
  }

  irAConfiguracion(): void {
    this.activeSection = 'CONFIG';
  }

  citasFiltradas(): Appointment[] {
    let resultado = this.citas;

    if (this.filtroEstado !== 'TODAS') {
      resultado = resultado.filter((cita) => cita.status === this.filtroEstado);
    }

    const texto = this.filtroTexto.trim().toLowerCase();
    if (texto.length > 0) {
      resultado = resultado.filter((cita) => {
        const cliente = cita.clientName.toLowerCase();
        const mascota = cita.petName.toLowerCase();
        const motivo = cita.reason.toLowerCase();
        return cliente.includes(texto) || mascota.includes(texto) || motivo.includes(texto);
      });
    }

    return resultado;
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

  confirmarCita(id: number): void {
    this.appointmentService.updateStatus(id, 'CONFIRMADA').subscribe((updated) => {
      if (!updated) {
        this.mensajeError = 'No se pudo confirmar la cita (mock).';
        return;
      }
      this.mensajeExito = 'Cita confirmada (mock).';
      if (this.veterinarioActual) {
        this.cargarCitas(this.veterinarioActual.id);
      }
    });
  }
}
