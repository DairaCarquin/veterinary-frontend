import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, Appointment } from '../../../service/appointment.service';
import { ClientService } from '../../../service/client.service';
import { PetService, Pet } from '../../../service/pet.service';
import { VetService, Veterinarian } from '../../../service/vet.service';
import { DynamicTableComponent, TableColumn, TableAction } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from '@angular/material/icon';
import { Client } from '../../../models/client.model';

@Component({
  standalone: true,
  selector: 'app-citas',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {

  clients: Client[] = [];
  allPets: Pet[] = [];
  vets: Veterinarian[] = [];
  filteredPets: Pet[] = [];
  errorMsg: string = '';

  constructor(
    private appointmentService: AppointmentService,
    private clientService: ClientService,
    private petService: PetService,
    private vetService: VetService
  ) { }

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'petId', label: 'Mascota' },
    { key: 'clientId', label: 'Cliente' },
    { key: 'veterinarianId', label: 'Veterinario' },
    { key: 'appointmentDate', label: 'Fecha' },
    { key: 'status', label: 'Estado' },
    { key: 'enabled', label: 'Activo' }
  ];

  actions: TableAction[] = [
    {
      name: 'status',
      icon: 'sync',
      color: '#dbeafe',
      iconColor: '#2563eb'
    },
    {
      name: 'reschedule',
      icon: 'event',
      color: '#fef3c7',
      iconColor: '#d97706'
    },
    {
      name: 'toggle',
      icon: 'toggle_on',
      color: '#fee2e2',
      iconColor: '#dc2626'
    }
  ];

  filters = [
    { key: 'petId', label: 'Mascota', placeholder: 'Pet ID' },
    { key: 'veterinarianId', label: 'Veterinario', placeholder: 'Vet ID' },
    { key: 'status', label: 'Estado', placeholder: 'Estado' }
  ];

  appointments: Appointment[] = [];
  selectedAppointment: any = null;

  showStatusModal = false;
  showRescheduleModal = false;
  showConfirmModal = false;

  showCreateModal = false;

  newAppointment: any = {
    petId: null,
    clientId: null,
    veterinarianId: null,
    appointmentDate: ''
  };

  selectedStatus: string = '';

  newRescheduleDate: string = '';
  newRescheduleVetId?: number;

  page = 0;
  size = 10;
  total = 0;

  ngOnInit(): void {
    this.loadClients();
    this.loadPets();
    this.loadVets();
    this.loadAppointments();
  }

  loadClients(): void {
    this.clientService.getClients(undefined, undefined, 0, 1000).subscribe(res => {
      this.clients = res.data;
    });
  }

  loadPets(): void {
    this.petService.getPets(undefined, undefined, undefined, 0, 1000).subscribe(res => {
      this.allPets = res.data;
    });
  }

  loadVets(): void {
    this.vetService.getVets(undefined, undefined, undefined, 0, 1000).subscribe(res => {
      this.vets = res.data;
    });
  }

  onClientChange(): void {
    this.filteredPetsByClient();
  }

  filteredPetsByClient(): void {
    if (!this.newAppointment.clientId) {
      this.filteredPets = [];
      return;
    }
    const clientId = Number(this.newAppointment.clientId);
    this.filteredPets = this.allPets.filter(p => p.ownerId === clientId);
  }

  loadAppointments(filters?: any) {
    this.appointmentService
      .getAppointments(
        filters?.petId,
        filters?.veterinarianId,
        filters?.status,
        undefined,
        this.page,
        this.size
      )
      .subscribe(res => {
        this.appointments = res.data;
        this.total = res.total;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadAppointments();
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadAppointments();
  }

  handleAction(event: { action: string, row: any }) {

    if (event.action === 'status') {
      this.selectedAppointment = event.row;
      this.selectedStatus = event.row.status;
      this.showStatusModal = true;
    }

    if (event.action === 'reschedule') {
      this.selectedAppointment = event.row;
      this.newRescheduleDate = '';
      this.newRescheduleVetId = undefined;
      this.showRescheduleModal = true;
    }

    if (event.action === 'toggle') {
      this.selectedAppointment = event.row;
      this.showConfirmModal = true;
    }
  }
  openCreateModal() {
    this.errorMsg = '';
    this.newAppointment = {
      petId: null,
      clientId: null,
      veterinarianId: null,
      appointmentDate: ''
    };
    this.filteredPets = [];
    this.showCreateModal = true;
  }

  createAppointment() {
    this.errorMsg = '';

    if (!this.newAppointment.clientId) {
      this.errorMsg = 'Selecciona un cliente';
      return;
    }

    if (!this.newAppointment.petId) {
      this.errorMsg = 'Selecciona una mascota';
      return;
    }

    if (!this.newAppointment.veterinarianId) {
      this.errorMsg = 'Selecciona un veterinario';
      return;
    }

    if (!this.newAppointment.appointmentDate) {
      this.errorMsg = 'Selecciona una fecha';
      return;
    }

    // Convertir valores a números para comparación correcta
    const petId = Number(this.newAppointment.petId);
    const clientId = Number(this.newAppointment.clientId);
    const vetId = Number(this.newAppointment.veterinarianId);

    // Validación: la mascota debe existir
    const pet = this.allPets.find(p => p.id === petId);
    if (!pet) {
      this.errorMsg = 'La mascota no existe';
      return;
    }

    // Validación: la mascota debe pertenecer al cliente seleccionado
    if (pet.ownerId !== clientId) {
      this.errorMsg = 'La mascota no pertenece a este cliente';
      return;
    }

    const payload = {
      petId: petId,
      clientId: clientId,
      veterinarianId: vetId,
      appointmentDate: new Date(this.newAppointment.appointmentDate).toISOString()
    };

    this.appointmentService.create(payload)
      .subscribe(() => {
        this.closeModals();
        this.loadAppointments();
      });
  }

  confirmReschedule() {

    if (!this.newRescheduleDate) return;

    const isoDate = new Date(this.newRescheduleDate).toISOString();

    this.appointmentService
      .reschedule(
        this.selectedAppointment.id,
        isoDate,
        this.newRescheduleVetId
      )
      .subscribe(() => {
        this.closeModals();
        this.loadAppointments();
      });
  }

  closeModals() {
    this.showStatusModal = false;
    this.showRescheduleModal = false;
    this.showConfirmModal = false;
    this.showCreateModal = false;
    this.selectedAppointment = null;
  }

  updateStatus() {
    this.appointmentService
      .updateStatus(this.selectedAppointment.id, this.selectedStatus)
      .subscribe(() => {
        this.closeModals();
        this.loadAppointments();
      });
  }

  reschedule(newDate: string, newVetId?: number) {
    this.appointmentService
      .reschedule(this.selectedAppointment.id, newDate, newVetId)
      .subscribe(() => {
        this.closeModals();
        this.loadAppointments();
      });
  }

  confirmToggle() {
    this.appointmentService
      .toggle(this.selectedAppointment.id, !this.selectedAppointment.enabled)
      .subscribe(() => {
        this.closeModals();
        this.loadAppointments();
      });
  }

}
