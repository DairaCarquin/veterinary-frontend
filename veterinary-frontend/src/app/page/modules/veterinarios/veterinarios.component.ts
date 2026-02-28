import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { DynamicTableComponent, TableAction, TableColumn } from '../../../componets/dynamic-table/dynamic-table.component';
import { VetService, Veterinarian } from '../../../service/vet.service';

@Component({
  standalone: true,
  selector: 'app-veterinarios',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon],
  templateUrl: './veterinarios.component.html',
  styleUrls: ['./veterinarios.component.css']
})
export class VeterinariosComponent implements OnInit {

  constructor(private vetService: VetService) {}

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'userId', label: 'User ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'specialty', label: 'Especialidad' },
    { key: 'licenseNumber', label: 'Licencia' },
    { key: 'email', label: 'Email' },
    { key: 'available', label: 'Disponible' },
    { key: 'enabled', label: 'Activo' }
  ];

  actions: TableAction[] = [
    {
      name: 'edit',
      icon: 'edit',
      color: '#dbeafe',
      iconColor: '#2563eb'
    },
    {
      name: 'toggle',
      icon: 'toggle_on',
      color: '#fee2e2',
      iconColor: '#dc2626'
    }
  ];

  filters = [
    { key: 'name', label: 'Nombre', placeholder: 'Buscar nombre' },
    { key: 'specialty', label: 'Especialidad', placeholder: 'Buscar especialidad' }
  ];

  vets: Veterinarian[] = [];
  selectedVet: any = null;

  showEditModal = false;
  showConfirmModal = false;

  page = 0;
  size = 10;
  total = 0;

  ngOnInit(): void {
    this.loadVets();
  }

  loadVets(filters?: any) {
    this.vetService
      .getVets(filters?.name, filters?.specialty, undefined, this.page, this.size)
      .subscribe(res => {
        this.vets = res.data;
        this.total = res.total;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadVets();
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadVets();
  }

  handleAction(event: { action: string, row: any }) {

    if (event.action === 'edit') {
      this.selectedVet = { ...event.row };
      this.showEditModal = true;
    }

    if (event.action === 'toggle') {
      this.selectedVet = event.row;
      this.showConfirmModal = true;
    }
  }

  closeModals() {
    this.showEditModal = false;
    this.showConfirmModal = false;
    this.selectedVet = null;
  }

  updateVet() {
    this.vetService.update(
      this.selectedVet.userId,
      this.selectedVet
    ).subscribe(() => {
      this.closeModals();
      this.loadVets();
    });
  }

  confirmToggle() {
    this.vetService.toggle(
      this.selectedVet.id,
      !this.selectedVet.enabled
    ).subscribe(() => {
      this.closeModals();
      this.loadVets();
    });
  }
}
