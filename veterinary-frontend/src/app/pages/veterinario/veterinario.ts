import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Veterinary } from '../../models/veterinary.model';
import { VeterinaryService } from '../../services/veterinary.service';

@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veterinario.html',
  styleUrl: './veterinario.css',
})
export class Veterinario implements OnInit {
  veterinarios: Veterinary[] = [];
  filteredVeterinarios: Veterinary[] = [];

  page = 1;
  size = 5;

  filterNombre = '';
  filterEspecialidad = '';

  // Métricas
  totalVeterinarios = 0;
  consultasHoy = 25;
  vacacionesActivas = 79;
  vacacionesAlDia = 52;

  // Datos para el gráfico
  meses = ['Septiembre', 'Noviembre', 'Diciembre', 'Enero'];
  valores = [2, 6, 8, 10];

  constructor(private veterinaryService: VeterinaryService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.veterinaryService.getVeterinarios().subscribe((data) => {
      this.veterinarios = data;
      this.filteredVeterinarios = [...data];
      this.totalVeterinarios = data.length;

      const activos = data.filter((v) => v.estado === 'Activo').length;
      const core = data.filter((v) => v.tipo === 'Core').length;

      this.vacacionesActivas = this.totalVeterinarios
        ? Math.round((activos / this.totalVeterinarios) * 100)
        : 0;
      this.vacacionesAlDia = this.totalVeterinarios
        ? Math.round((core / this.totalVeterinarios) * 100)
        : 0;
    });
  }

  aplicarFiltros() {
    this.filteredVeterinarios = this.veterinarios.filter((v) => {
      const nombreMatch = v.nombre.toLowerCase().includes(this.filterNombre.toLowerCase());
      const especialidadMatch = v.especialidad
        .toLowerCase()
        .includes(this.filterEspecialidad.toLowerCase());
      return nombreMatch && especialidadMatch;
    });

    this.page = 1;
  }

  limpiarFiltros() {
    this.filterNombre = '';
    this.filterEspecialidad = '';
    this.filteredVeterinarios = [...this.veterinarios];
    this.page = 1;
  }

  cambiarPagina(delta: number) {
    const totalPaginas = Math.max(1, Math.ceil(this.filteredVeterinarios.length / this.size));
    const nueva = this.page + delta;
    if (nueva >= 1 && nueva <= totalPaginas) {
      this.page = nueva;
    }
  }

  get totalPaginas(): number {
    if (this.size <= 0) {
      return 1;
    }
    const total = Math.ceil(this.filteredVeterinarios.length / this.size);
    return total || 1;
  }

  getBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'Core':
        return 'badge-core';
      case 'Noncore':
        return 'badge-noncore';
      case 'Overdue':
        return 'badge-overdue';
      default:
        return 'badge-default';
    }
  }
}