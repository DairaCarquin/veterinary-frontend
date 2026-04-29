import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DynamicTableComponent, TableColumn, TableAction } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from '@angular/material/icon';
import { Pet, PetService } from '../../../service/pet.service';
import { ClientService } from '../../../service/client.service';
import {
  SearchableSelectComponent,
  SearchableSelectOption
} from '../../../componets/searchable-select/searchable-select.component';
import { booleanBadge } from '../../../utils/table-display.util';
import {
  hasDigits,
  hasInvalidNameCharacters,
  hasLetters,
  hasSpecialCharacters,
  hasWhitespace,
  isValidName
} from '../../../utils/form-validation.util';
import { AuthService } from '../../../service/auth.service';

@Component({
  standalone: true,
  selector: 'app-mascotas',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon, SearchableSelectComponent],
  templateUrl: './mascotas.component.html',
  styleUrls: ['./mascotas.component.css']
})
export class MascotasComponent implements OnInit {

  constructor(
    private petService: PetService,
    private clientService: ClientService,
    private authService: AuthService
  ) {}

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'species', label: 'Especie' },
    { key: 'breed', label: 'Raza' },
    { key: 'age', label: 'Edad' },
    { key: 'ownerDisplay', label: 'Owner' },
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
    { key: 'species', label: 'Especie', placeholder: 'Buscar especie' },
    { key: 'ownerId', label: 'Owner ID', placeholder: 'Buscar propietario' }
  ];

  pets: Pet[] = [];
  selectedPet: any = null;
  ownerOptions: SearchableSelectOption[] = [];
  ownerLoading = false;
  selectedOwnerLabel = '';

  showCreateModal = false;
  showEditModal = false;
  showConfirmModal = false;
  createPetError = '';
  editPetError = '';
  submittedCreate = false;
  submittedEdit = false;
  touchedCreateFields: Record<string, boolean> = {};
  touchedEditFields: Record<string, boolean> = {};

  page = 0;
  size = 10;
  total = 0;
  currentFilters: any = {};
  private ownerNameCache = new Map<number, string>();
  private readonly role = this.authService.getRole();

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(filters?: any) {
    this.currentFilters = filters ?? this.currentFilters;
    this.petService
      .getPets(this.currentFilters?.name, this.currentFilters?.species, this.currentFilters?.ownerId, this.page, this.size)
      .subscribe(res => {
        const pets = res.data || [];
        if (this.role === 'CLIENT') {
          this.pets = this.mapPetsWithOwner(pets);
          this.total = res.total;
          return;
        }

        const ownerIds = [...new Set(pets.map(pet => pet.ownerId).filter((ownerId): ownerId is number => !!ownerId))];
        const missingOwnerIds = ownerIds.filter(ownerId => !this.ownerNameCache.has(ownerId));

        if (missingOwnerIds.length === 0) {
          this.pets = this.mapPetsWithOwner(pets);
          this.total = res.total;
          return;
        }

        forkJoin(
          missingOwnerIds.map(ownerId =>
            this.clientService.getById(ownerId).pipe(
              map(response => ({
                ownerId,
                ownerName: `${response.data.firstName} ${response.data.lastName}`.trim() || response.data.email
              })),
              catchError(() => of({ ownerId, ownerName: `Cliente ${ownerId}` }))
            )
          )
        ).subscribe(ownerResults => {
          ownerResults.forEach(result => this.ownerNameCache.set(result.ownerId, result.ownerName));
          this.pets = this.mapPetsWithOwner(pets);
          this.total = res.total;
        });
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadPets(this.currentFilters);
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadPets(this.currentFilters);
  }

  handleAction(event: { action: string, row: any }) {
    if (event.action === 'edit') {
      this.selectedPet = { ...event.row };
      this.editPetError = '';
      this.submittedEdit = false;
      this.touchedEditFields = {};
      this.showEditModal = true;
    }

    if (event.action === 'toggle') {
      this.selectedPet = event.row;
      this.showConfirmModal = true;
    }
  }

  openCreateModal() {
    this.selectedPet = {
      name: '',
      species: '',
      breed: '',
      age: '',
      ownerId: null
    };
    this.createPetError = '';
    this.submittedCreate = false;
    this.touchedCreateFields = {};
    this.selectedOwnerLabel = '';
    this.ownerOptions = [];
    this.searchOwners('');
    this.showCreateModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showConfirmModal = false;
    this.selectedPet = null;
    this.createPetError = '';
    this.editPetError = '';
    this.submittedCreate = false;
    this.submittedEdit = false;
    this.touchedCreateFields = {};
    this.touchedEditFields = {};
    this.selectedOwnerLabel = '';
    this.ownerOptions = [];
  }

  onCreateFieldChange(field: 'name' | 'species' | 'breed' | 'age', value: string) {
    this.touchedCreateFields[field] = true;
    this.selectedPet[field] = value ?? '';
    this.createPetError = '';
  }

  onEditFieldChange(field: 'name' | 'species' | 'breed' | 'age', value: string) {
    this.touchedEditFields[field] = true;
    this.selectedPet[field] = value ?? '';
    this.editPetError = '';
  }

  createPet() {
    this.submittedCreate = true;
    const errors = this.getCreateErrors();
    if (Object.keys(errors).length > 0) {
      this.createPetError = 'Corrige los campos marcados antes de continuar.';
      return;
    }

    this.petService.create(this.selectedPet)
      .subscribe(() => {
        this.closeModals();
        this.loadPets();
      });
  }

  updatePet() {
    this.submittedEdit = true;
    const errors = this.getEditErrors();
    if (Object.keys(errors).length > 0) {
      this.editPetError = 'Corrige los campos marcados antes de continuar.';
      return;
    }

    this.petService.update(this.selectedPet.id, this.selectedPet)
      .subscribe(() => {
        this.closeModals();
        this.loadPets();
      });
  }

  confirmToggle() {
    this.petService.toggle(
      this.selectedPet.id,
      !this.selectedPet.enabled
    ).subscribe(() => {
      this.closeModals();
      this.loadPets();
    });
  }

  searchOwners(term: string) {
    this.ownerLoading = true;

    const value = term.trim();
    const email = value.includes('@') ? value : undefined;
    const dni = /^\d+$/.test(value) ? value : undefined;
    const name = !email && !dni ? value : undefined;

    this.clientService.getClients(name, dni, email, 0, 15)
      .subscribe({
        next: (res) => {
          this.ownerOptions = (res.data || []).map(client => ({
            id: client.id,
            label: `${client.firstName} ${client.lastName}`.trim() || client.email,
            description: `${client.email} - DNI ${client.dni}`,
            metadata: { client }
          }));
          this.ownerLoading = false;
        },
        error: () => {
          this.ownerOptions = [];
          this.ownerLoading = false;
        }
      });
  }

  selectOwner(option: SearchableSelectOption) {
    this.touchedCreateFields['ownerId'] = true;
    this.selectedPet.ownerId = option.id;
    this.selectedOwnerLabel = option.label;
    this.createPetError = '';
  }

  clearOwnerSelection() {
    this.touchedCreateFields['ownerId'] = true;
    this.selectedPet.ownerId = null;
    this.selectedOwnerLabel = '';
  }

  hasCreateFieldError(field: string): boolean {
    return (!!this.touchedCreateFields[field] || this.submittedCreate) && !!this.getCreateErrors()[field];
  }

  hasEditFieldError(field: string): boolean {
    return (!!this.touchedEditFields[field] || this.submittedEdit) && !!this.getEditErrors()[field];
  }

  getCreateFieldError(field: string): string {
    return this.getCreateErrors()[field] ?? '';
  }

  getEditFieldError(field: string): string {
    return this.getEditErrors()[field] ?? '';
  }

  canCreatePet(): boolean {
    return Object.keys(this.getCreateErrors()).length === 0;
  }

  canUpdatePet(): boolean {
    return Object.keys(this.getEditErrors()).length === 0;
  }

  private getCreateErrors(): Record<string, string> {
    return this.validatePet(this.selectedPet, true);
  }

  private getEditErrors(): Record<string, string> {
    return this.validatePet(this.selectedPet, false);
  }

  private validatePet(pet: any, requireOwner: boolean): Record<string, string> {
    const errors: Record<string, string> = {};
    const name = pet?.name ?? '';
    const species = pet?.species ?? '';
    const breed = pet?.breed ?? '';
    const ageValue = `${pet?.age ?? ''}`;

    this.validateTextField(name, 'nombre', 'name', errors);
    this.validateTextField(species, 'especie', 'species', errors);
    this.validateTextField(breed, 'raza', 'breed', errors);

    if (!ageValue.trim()) {
      errors['age'] = 'La edad es obligatoria.';
    } else if (hasWhitespace(ageValue)) {
      errors['age'] = 'La edad no puede contener espacios.';
    } else if (hasLetters(ageValue)) {
      errors['age'] = 'La edad no puede contener letras.';
    } else if (hasSpecialCharacters(ageValue)) {
      errors['age'] = 'La edad no puede contener caracteres especiales.';
    } else if (!/^\d+$/.test(ageValue)) {
      errors['age'] = 'La edad solo puede contener numeros.';
    }

    if (requireOwner && !pet?.ownerId) {
      errors['ownerId'] = 'Selecciona un propietario.';
    }

    return errors;
  }

  private validateTextField(value: string, label: string, key: string, errors: Record<string, string>) {
    if (!value?.trim()) {
      errors[key] = `El ${label} es obligatorio.`;
    } else if (hasDigits(value)) {
      errors[key] = `El ${label} no puede contener numeros.`;
    } else if (hasInvalidNameCharacters(value)) {
      errors[key] = `El ${label} no puede contener caracteres especiales.`;
    } else if (!isValidName(value)) {
      errors[key] = `El ${label} solo puede contener letras.`;
    }
  }

  private mapPetsWithOwner(pets: Pet[]): Pet[] {
    return pets.map(pet => ({
      ...pet,
      ownerDisplay: this.role === 'CLIENT'
        ? 'Mi cuenta'
        : `${pet.ownerId} - ${this.ownerNameCache.get(pet.ownerId) ?? `Cliente ${pet.ownerId}`}`,
      enabledDisplay: booleanBadge(!!pet.enabled)
    }));
  }
}
