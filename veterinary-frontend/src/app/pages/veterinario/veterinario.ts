import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Veterinary } from '../../models/veterinary.model';

@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './veterinario.html',
  styleUrl: './veterinario.css',
})
export class Veterinario implements OnInit {
  veterinarios: Veterinary[] = [];

  page = 1;
  size = 5;

  filterNombre = '';
  filterEspecialidad = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.veterinarios = [
      {
        id: 1,
        nombre: 'Dr. Juan Pérez',
        especialidad: 'Cirugía',
        telefono: '987654321',
        estado: 'Activo',
      },
      {
        id: 2,
        nombre: 'Dra. María López',
        especialidad: 'Dermatología',
        telefono: '912345678',
        estado: 'Activo',
      },
    ];
  }

  limpiarFiltros() {
    this.filterNombre = '';
    this.filterEspecialidad = '';
  }
}
