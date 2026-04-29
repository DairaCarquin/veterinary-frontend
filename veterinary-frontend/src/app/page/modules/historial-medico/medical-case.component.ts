import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalCase, MedicalHistoryService } from '../../../service/medical-history.service';
import { MatIcon } from '@angular/material/icon';
import { DynamicTableComponent, TableAction, TableColumn } from '../../../componets/dynamic-table/dynamic-table.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  standalone: true,
  selector: 'app-medical-case',
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    MatIcon
  ],
  templateUrl: './medical-case.component.html',
  styleUrls: ['./medical-case.component.css']
})
export class MedicalCaseComponent implements OnInit {

  constructor(
    private medicalService: MedicalHistoryService,
    private router: Router,
    private authService: AuthService
  ) { }

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'appointmentId', label: 'Cita' },
    { key: 'petId', label: 'Mascota' },
    { key: 'clientId', label: 'Cliente' },
    { key: 'veterinarianId', label: 'Veterinario' },
    { key: 'createdAt', label: 'Fecha' }
  ];

  actions: TableAction[] = [
    { name: 'analysis', icon: 'science', color: '#e0f2fe', iconColor: '#0284c7' },
    { name: 'diagnosis', icon: 'medical_services', color: '#ede9fe', iconColor: '#7c3aed' },
    { name: 'referral', icon: 'send', color: '#fef3c7', iconColor: '#d97706' },
    { name: 'treatment', icon: 'healing', color: '#dcfce7', iconColor: '#16a34a' }
  ];

  cases: MedicalCase[] = [];
  page = 0;
  size = 10;
  total = 0;
  currentFilters: any = {};
  readonly role = this.authService.getRole();

  filters = [
    { key: 'appointmentId', label: 'Cita', placeholder: 'Buscar por cita' },
    { key: 'petId', label: 'Mascota', placeholder: 'Buscar por mascota' },
    { key: 'veterinarianId', label: 'Veterinario', placeholder: 'Buscar por veterinario' }
  ];

  ngOnInit() { this.loadCases(); }

  loadCases(filters?: any) {
    this.currentFilters = filters ?? this.currentFilters;
    this.medicalService
      .getMedicalCases(this.currentFilters?.appointmentId, this.currentFilters?.petId, this.currentFilters?.veterinarianId, this.page, this.size)
      .subscribe(res => {
        this.cases = res.data;
        this.total = res.total;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadCases(this.currentFilters);
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadCases(this.currentFilters);
  }

  handleAction(event: any) {
    this.router.navigate([
      '/medical-case',
      event.row.id,
      event.action
    ]);
  }

  get pageTitle(): string {
    if (this.role === 'CLIENT') {
      return 'Historial Medico de Mis Mascotas';
    }

    if (this.role === 'VETERINARY') {
      return 'Historial Medico de Mis Pacientes';
    }

    return 'Gestion de Historial Medico';
  }

  get pageSubtitle(): string {
    if (this.role === 'CLIENT') {
      return 'Consulta casos clinicos, diagnosticos, analisis y tratamientos de tus mascotas.';
    }

    if (this.role === 'VETERINARY') {
      return 'Revisa casos clinicos asignados y entra al detalle medico de cada paciente.';
    }

    return 'Revisa los casos clinicos con el mismo estilo usado en el resto de la administracion.';
  }
}
