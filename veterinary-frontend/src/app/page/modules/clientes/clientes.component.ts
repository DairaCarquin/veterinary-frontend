import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../service/client.service';
import { DynamicTableComponent, TableAction, TableColumn } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from '@angular/material/icon';
import {
  isMasterdogEmail,
  isValidDni,
  isValidPhone,
  normalizeEmail,
  sanitizeDigits
} from '../../../utils/form-validation.util';

@Component({
  standalone: true,
  selector: 'app-clientes',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'userId', label: 'Codigo de Usuario' },
    { key: 'username', label: 'Usuario' },
    { key: 'fullName', label: 'Nombre' },
    { key: 'dni', label: 'DNI' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefono' },
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

  clients: any[] = [];
  selectedClient: any = null;
  editableFields: Record<string, boolean> = {};
  showEditModal = false;
  showConfirmModal = false;
  updateError = '';
  updateFieldErrors: Record<string, string> = {};
  submittedUpdate = false;

  constructor(private readonly clientService: ClientService) { }

  ngOnInit(): void {
    this.loadClients();
  }

  filters = [
    { key: 'name', label: 'Nombre', placeholder: 'Buscar por nombre' },
    { key: 'dni', label: 'DNI', placeholder: 'Buscar por DNI' },
    { key: 'email', label: 'Email', placeholder: 'Buscar por email' }
  ];

  page = 0;
  size = 10;
  total = 0;
  currentFilters: any = {};

  loadClients(filters?: any) {
    this.currentFilters = filters ?? this.currentFilters;
    this.clientService
      .getClients(this.currentFilters?.name, this.currentFilters?.dni, this.currentFilters?.email, this.page, this.size)
      .subscribe(res => {
        this.clients = res.data.map(c => ({
          ...c,
          fullName: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()
        }));

        this.total = res.total ?? res.data.length;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadClients(this.currentFilters);
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadClients(this.currentFilters);
  }

  handleAction(event: { action: string, row: any }) {
    if (event.action === 'edit') {
      this.openEditModal(event.row);
    }

    if (event.action === 'toggle') {
      this.openConfirmModal(event.row);
    }
  }

  openEditModal(client: any) {
    this.selectedClient = { ...client };
    this.editableFields = {
      firstName: this.isMissing(client.firstName),
      lastName: this.isMissing(client.lastName),
      dni: this.isEditableDni(client.dni),
      email: this.isEditableEmail(client.email),
      phone: this.isEditablePhone(client.phone)
    };
    this.updateError = '';
    this.updateFieldErrors = {};
    this.submittedUpdate = false;
    this.showEditModal = true;
  }

  openConfirmModal(client: any) {
    this.selectedClient = client;
    this.showConfirmModal = true;
  }

  closeModals() {
    this.showEditModal = false;
    this.showConfirmModal = false;
    this.selectedClient = null;
    this.editableFields = {};
    this.updateError = '';
    this.updateFieldErrors = {};
    this.submittedUpdate = false;
  }

  canEditField(field: string): boolean {
    return !!this.editableFields[field];
  }

  isMissing(value: unknown): boolean {
    return value === null || value === undefined || String(value).trim() === '';
  }

  isEditableEmail(value: string): boolean {
    return this.isMissing(value) || !isMasterdogEmail(value);
  }

  isEditableDni(value: string): boolean {
    return this.isMissing(value) || !isValidDni(value);
  }

  isEditablePhone(value: string): boolean {
    return this.isMissing(value) || !isValidPhone(value);
  }

  onClientEmailChange(value: string) {
    this.selectedClient.email = normalizeEmail(value);
    this.refreshUpdateValidation();
  }

  onClientNameChange(field: 'firstName' | 'lastName', value: string) {
    this.selectedClient[field] = value ?? '';
    this.refreshUpdateValidation();
  }

  onClientDigitsChange(field: 'dni' | 'phone', value: string, maxLength: number) {
    this.selectedClient[field] = sanitizeDigits(value, maxLength);
    this.refreshUpdateValidation();
  }

  updateClient() {
    if (!this.selectedClient) {
      return;
    }

    this.submittedUpdate = true;
    this.updateFieldErrors = this.validateClient();

    if (Object.keys(this.updateFieldErrors).length > 0) {
      this.updateError = 'Corrige los campos marcados antes de guardar.';
      return;
    }

    this.clientService.update(
      this.selectedClient.id,
      this.selectedClient
    ).subscribe({
      next: () => {
        this.closeModals();
        this.loadClients();
      },
      error: (error) => {
        this.updateFieldErrors = error?.error?.fields ?? {};
        this.updateError = error?.error?.message ?? 'No se pudo actualizar el cliente.';
      }
    });
  }

  canUpdateClient(): boolean {
    return !!this.selectedClient && Object.keys(this.validateClient()).length === 0;
  }

  getUpdateFieldError(field: string): string {
    return this.updateFieldErrors[field] ?? '';
  }

  confirmToggle() {
    if (!this.selectedClient) return;

    this.clientService.toggle(
      this.selectedClient.id,
      !this.selectedClient.enabled
    ).subscribe(() => {
      this.closeModals();
      this.loadClients();
    });
  }

  public refreshUpdateValidation() {
    if (!this.submittedUpdate) {
      return;
    }

    this.updateFieldErrors = this.validateClient();
  }

  private validateClient(): Record<string, string> {
    if (!this.selectedClient) {
      return {};
    }

    const errors: Record<string, string> = {};

    if (!this.selectedClient.firstName?.trim()) {
      errors['firstName'] = 'El nombre es obligatorio.';
    }

    if (!this.selectedClient.lastName?.trim()) {
      errors['lastName'] = 'El apellido es obligatorio.';
    }

    if (!isValidDni(this.selectedClient.dni ?? '')) {
      errors['dni'] = 'El DNI debe tener 8 digitos.';
    }

    if (!isMasterdogEmail(this.selectedClient.email ?? '')) {
      errors['email'] = 'El email debe terminar en @masterdog.com.';
    }

    if (!isValidPhone(this.selectedClient.phone ?? '')) {
      errors['phone'] = 'El telefono debe tener 9 digitos.';
    }

    return errors;
  }
}
