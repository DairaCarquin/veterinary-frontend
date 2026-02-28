import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalCase, MedicalHistoryService } from '../../../service/medical-history.service';
import { MatIcon } from '@angular/material/icon';
import { DynamicTableComponent, TableAction, TableColumn } from '../../../componets/dynamic-table/dynamic-table.component';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-medical-case',
  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    MatIcon
  ],
  templateUrl: './medical-case.component.html'
})
export class MedicalCaseComponent implements OnInit {

  constructor(
    private medicalService: MedicalHistoryService,
    private router: Router
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

  ngOnInit() { this.loadCases(); }

  loadCases(filters?: any) {
    this.medicalService
      .getMedicalCases(filters?.appointmentId, filters?.petId, filters?.veterinarianId, this.page, this.size)
      .subscribe(res => {
        this.cases = res.data;
        this.total = res.total;
      });
  }

  handleAction(event: any) {
    this.router.navigate([
      '/medical-case',
      event.row.id,
      event.action
    ]);
  }
}
