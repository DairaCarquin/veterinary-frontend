import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { DynamicTableComponent, TableAction, TableColumn } from '../../../componets/dynamic-table/dynamic-table.component';
import { VetService } from '../../../service/vet.service';
import {
  hasDigits,
  hasInvalidNameCharacters,
  hasLetters,
  hasSpecialCharacters,
  hasWhitespace,
  isMasterdogEmail,
  isValidDni,
  isValidPhone,
  normalizeEmail,
  sanitizeDigits
} from '../../../utils/form-validation.util';
import { booleanBadge } from '../../../utils/table-display.util';

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
    { key: 'fullName', label: 'Nombre' },
    { key: 'dni', label: 'DNI' },
    { key: 'specialty', label: 'Especialidad' },
    { key: 'licenseNumber', label: 'Licencia' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefono' },
    { key: 'availableDisplay', label: 'Disponible' },
    { key: 'enabledDisplay', label: 'Activo' }
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

  vets: any[] = [];
  selectedVet: any = null;
  editableFields: Record<string, boolean> = {};
  showEditModal = false;
  showConfirmModal = false;
  updateError = '';
  updateFieldErrors: Record<string, string> = {};
  submittedUpdate = false;

  page = 0;
  size = 10;
  total = 0;
  currentFilters: any = {};

  ngOnInit(): void {
    this.loadVets();
  }

  loadVets(filters?: any) {
    this.currentFilters = filters ?? this.currentFilters;
    this.vetService
      .getVets(this.currentFilters?.name, this.currentFilters?.specialty, undefined, this.page, this.size)
      .subscribe(res => {
        this.vets = res.data.map(vet => ({
          ...vet,
          fullName: `${vet.name ?? ''} ${vet.lastName ?? ''}`.trim(),
          availableDisplay: booleanBadge(!!vet.available, 'Disponible', 'No disponible'),
          enabledDisplay: booleanBadge(!!vet.enabled)
        }));
        this.total = res.total;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadVets(this.currentFilters);
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadVets(this.currentFilters);
  }

  handleAction(event: { action: string, row: any }) {
    if (event.action === 'edit') {
      this.selectedVet = { ...event.row };
      this.editableFields = {
        name: this.isMissing(event.row.name),
        lastName: this.isMissing(event.row.lastName),
        dni: this.isEditableDni(event.row.dni),
        specialty: this.isMissing(event.row.specialty),
        licenseNumber: this.isMissing(event.row.licenseNumber),
        email: this.isEditableEmail(event.row.email),
        phone: this.isEditablePhone(event.row.phone)
      };
      this.updateError = '';
      this.updateFieldErrors = {};
      this.submittedUpdate = false;
      this.showEditModal = true;
    }

    if (event.action === 'toggle') {
      this.selectedVet = event.row;
      this.showConfirmModal = true;
    }
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

  closeModals() {
    this.showEditModal = false;
    this.showConfirmModal = false;
    this.selectedVet = null;
    this.editableFields = {};
    this.updateError = '';
    this.updateFieldErrors = {};
    this.submittedUpdate = false;
  }

  canEditField(field: string): boolean {
    return !!this.editableFields[field];
  }

  onVetNameChange(field: 'name' | 'lastName' | 'specialty' | 'licenseNumber', value: string) {
    this.selectedVet[field] = value ?? '';
    this.refreshUpdateValidation();
  }

  onVetEmailChange(value: string) {
    this.selectedVet.email = normalizeEmail(value);
    this.refreshUpdateValidation();
  }

  onVetDigitsChange(field: 'dni' | 'phone', value: string, maxLength: number) {
    this.selectedVet[field] = sanitizeDigits(value, maxLength);
    this.refreshUpdateValidation();
  }

  updateVet() {
    this.submittedUpdate = true;
    this.updateFieldErrors = this.validateVet();

    if (Object.keys(this.updateFieldErrors).length > 0) {
      this.updateError = 'Corrige los campos marcados antes de guardar.';
      return;
    }

    this.vetService.update(
      this.selectedVet.userId,
      this.selectedVet
    ).subscribe({
      next: () => {
        this.closeModals();
        this.loadVets();
      },
      error: (error) => {
        this.updateFieldErrors = error?.error?.fields ?? {};
        this.updateError = error?.error?.message ?? 'No se pudo actualizar el veterinario.';
      }
    });
  }

  canUpdateVet(): boolean {
    return !!this.selectedVet && Object.keys(this.validateVet()).length === 0;
  }

  getUpdateFieldError(field: string): string {
    return this.updateFieldErrors[field] ?? '';
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

  public refreshUpdateValidation() {
    if (!this.submittedUpdate) {
      return;
    }

    this.updateFieldErrors = this.validateVet();
  }

  private validateVet(): Record<string, string> {
    if (!this.selectedVet) {
      return {};
    }

    const errors: Record<string, string> = {};

    if (!this.selectedVet.name?.trim()) {
      errors['name'] = 'El nombre es obligatorio.';
    }

    if (!this.selectedVet.lastName?.trim()) {
      errors['lastName'] = 'El apellido es obligatorio.';
    }

    if (!isValidDni(this.selectedVet.dni ?? '')) {
      errors['dni'] = 'El DNI debe tener 8 digitos.';
    }

    if (!this.selectedVet.specialty?.trim()) {
      errors['specialty'] = 'La especialidad es obligatoria.';
    } else if (hasDigits(this.selectedVet.specialty)) {
      errors['specialty'] = 'La especialidad no puede contener numeros.';
    } else if (hasInvalidNameCharacters(this.selectedVet.specialty)) {
      errors['specialty'] = 'La especialidad no puede contener caracteres especiales.';
    }

    if (!this.selectedVet.licenseNumber?.trim()) {
      errors['licenseNumber'] = 'La licencia es obligatoria.';
    } else if (hasWhitespace(this.selectedVet.licenseNumber)) {
      errors['licenseNumber'] = 'La licencia no puede contener espacios.';
    } else if (hasLetters(this.selectedVet.licenseNumber)) {
      errors['licenseNumber'] = 'La licencia no puede contener letras.';
    } else if (hasSpecialCharacters(this.selectedVet.licenseNumber)) {
      errors['licenseNumber'] = 'La licencia no puede contener caracteres especiales.';
    } else if (!/^\d{5}$/.test(this.selectedVet.licenseNumber)) {
      errors['licenseNumber'] = 'La licencia debe tener exactamente 5 digitos.';
    }

    if (!isMasterdogEmail(this.selectedVet.email ?? '')) {
      errors['email'] = 'El email debe terminar en @masterdog.com.';
    }

    if (!isValidPhone(this.selectedVet.phone ?? '')) {
      errors['phone'] = 'El telefono debe tener 9 digitos.';
    }

    return errors;
  }
}
