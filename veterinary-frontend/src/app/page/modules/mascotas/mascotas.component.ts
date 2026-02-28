import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicTableComponent, TableColumn, TableAction } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from '@angular/material/icon';
import { Pet, PetService } from '../../../service/pet.service';

@Component({
  standalone: true,
  selector: 'app-mascotas',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon],
  templateUrl: './mascotas.component.html',
  styleUrls: ['./mascotas.component.css']
})
export class MascotasComponent implements OnInit {

  constructor(private petService: PetService) {}

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'species', label: 'Especie' },
    { key: 'breed', label: 'Raza' },
    { key: 'age', label: 'Edad' },
    { key: 'ownerId', label: 'Owner ID' },
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
    { key: 'species', label: 'Especie', placeholder: 'Buscar especie' },
    { key: 'ownerId', label: 'Owner ID', placeholder: 'Buscar propietario' }
  ];

  pets: Pet[] = [];
  selectedPet: any = null;

  showCreateModal = false;
  showEditModal = false;
  showConfirmModal = false;

  page = 0;
  size = 10;
  total = 0;

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(filters?: any) {
    this.petService
      .getPets(filters?.name, filters?.species, filters?.ownerId, this.page, this.size)
      .subscribe(res => {
        this.pets = res.data;
        this.total = res.total;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadPets();
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadPets();
  }

  handleAction(event: { action: string, row: any }) {
    if (event.action === 'edit') {
      this.selectedPet = { ...event.row };
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
      age: 0,
      ownerId: null
    };
    this.showCreateModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showConfirmModal = false;
    this.selectedPet = null;
  }

  createPet() {
    this.petService.create(this.selectedPet)
      .subscribe(() => {
        this.closeModals();
        this.loadPets();
      });
  }

  updatePet() {
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
}
