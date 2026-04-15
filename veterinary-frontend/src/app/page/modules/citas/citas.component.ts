import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, Appointment } from '../../../service/appointment.service';
import { DynamicTableComponent, TableColumn, TableAction } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from '@angular/material/icon';
import { Pet, PetService } from '../../../service/pet.service';
import { ClientService } from '../../../service/client.service';
import { Client } from '../../../models/client.model';
import { VetService, Veterinarian } from '../../../service/vet.service';
import {
  SearchableSelectComponent,
  SearchableSelectOption
} from '../../../componets/searchable-select/searchable-select.component';
import {
  appointmentStatusBadge,
  booleanBadge,
  formatDateTime
} from '../../../utils/table-display.util';

@Component({
  standalone: true,
  selector: 'app-citas',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon, SearchableSelectComponent],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {

  constructor(
    private appointmentService: AppointmentService,
    private petService: PetService,
    private clientService: ClientService,
    private vetService: VetService
  ) { }

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'petId', label: 'Mascota' },
    { key: 'clientId', label: 'Cliente' },
    { key: 'veterinarianId', label: 'Veterinario' },
    { key: 'appointmentDateDisplay', label: 'Fecha' },
    { key: 'statusDisplay', label: 'Estado' },
    { key: 'enabledDisplay', label: 'Activo' }
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
  createError = '';

  showStatusModal = false;
  showRescheduleModal = false;
  showConfirmModal = false;
  showCreateModal = false;

  newAppointment: any = {
    petId: null,
    clientId: null,
    veterinarianId: null,
    appointmentDate: '',
    reason: ''
  };

  petOptions: SearchableSelectOption[] = [];
  vetOptions: SearchableSelectOption[] = [];
  rescheduleVetOptions: SearchableSelectOption[] = [];
  petLoading = false;
  vetLoading = false;
  rescheduleVetLoading = false;
  selectedPetLabel = '';
  selectedClientLabel = '';
  selectedVetLabel = '';
  selectedRescheduleVetLabel = '';

  selectedStatus = '';
  newRescheduleDate = '';
  newRescheduleVetId?: number;

  page = 0;
  size = 10;
  total = 0;
  currentFilters: any = {};

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(filters?: any) {
    this.currentFilters = filters ?? this.currentFilters;
    this.appointmentService
      .getAppointments(
        this.currentFilters?.petId,
        this.currentFilters?.veterinarianId,
        this.currentFilters?.status,
        undefined,
        this.page,
        this.size
      )
      .subscribe(res => {
        this.appointments = res.data.map(appointment => ({
          ...appointment,
          appointmentDateDisplay: formatDateTime(appointment.appointmentDate),
          statusDisplay: appointmentStatusBadge(appointment.status),
          enabledDisplay: booleanBadge(!!appointment.enabled)
        }));
        this.total = res.total;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadAppointments(this.currentFilters);
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadAppointments(this.currentFilters);
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
      this.selectedRescheduleVetLabel = '';
      this.rescheduleVetOptions = [];
      this.searchRescheduleVets('');
      this.showRescheduleModal = true;
    }

    if (event.action === 'toggle') {
      this.selectedAppointment = event.row;
      this.showConfirmModal = true;
    }
  }

  openCreateModal() {
    this.newAppointment = {
      petId: null,
      clientId: null,
      veterinarianId: null,
      appointmentDate: '',
      reason: ''
    };
    this.createError = '';
    this.selectedPetLabel = '';
    this.selectedClientLabel = '';
    this.selectedVetLabel = '';
    this.petOptions = [];
    this.vetOptions = [];
    this.searchPets('');
    this.searchVets('');
    this.showCreateModal = true;
  }

  createAppointment() {
    if (!this.newAppointment.petId || !this.newAppointment.clientId || !this.newAppointment.veterinarianId || !this.newAppointment.appointmentDate || !this.newAppointment.reason?.trim()) {
      this.createError = 'Completa mascota, cliente, veterinario, fecha y motivo antes de crear.';
      return;
    }

    const payload = {
      ...this.newAppointment,
      appointmentDate: new Date(this.newAppointment.appointmentDate).toISOString(),
      reason: this.newAppointment.reason.trim()
    };

    this.appointmentService.create(payload)
      .subscribe({
        next: () => {
          this.closeModals();
          this.loadAppointments();
        },
        error: (error) => {
          this.createError = error?.error?.message ?? 'No se pudo crear la cita.';
          console.error(error);
        }
      });
  }

  confirmReschedule() {
    if (!this.newRescheduleDate) {
      return;
    }

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
    this.createError = '';
    this.selectedPetLabel = '';
    this.selectedClientLabel = '';
    this.selectedVetLabel = '';
    this.selectedRescheduleVetLabel = '';
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

  searchPets(term: string) {
    this.petLoading = true;

    this.petService.getPets(term.trim() || undefined, undefined, undefined, 0, 15)
      .subscribe({
        next: (res) => {
          this.petOptions = (res.data || []).map(pet => ({
            id: pet.id,
            label: pet.name,
            description: `${pet.species} - ${pet.breed} - Propietario #${pet.ownerId}`,
            metadata: { pet }
          }));
          this.petLoading = false;
        },
        error: () => {
          this.petOptions = [];
          this.petLoading = false;
        }
      });
  }

  selectPet(option: SearchableSelectOption) {
    const pet = option.metadata?.['pet'] as Pet | undefined;

    this.newAppointment.petId = option.id;
    this.newAppointment.clientId = pet?.ownerId ?? null;
    this.selectedPetLabel = option.label;
    this.createError = '';

    if (pet?.ownerId) {
      this.loadClientLabel(pet.ownerId);
      return;
    }

    this.selectedClientLabel = '';
  }

  clearPetSelection() {
    this.newAppointment.petId = null;
    this.newAppointment.clientId = null;
    this.selectedPetLabel = '';
    this.selectedClientLabel = '';
  }

  searchVets(term: string) {
    this.vetLoading = true;

    this.vetService.getVets(term.trim() || undefined, undefined, undefined, 0, 15)
      .subscribe({
        next: (res) => {
          this.vetOptions = this.mapVetOptions(res.data || []);
          this.vetLoading = false;
        },
        error: () => {
          this.vetOptions = [];
          this.vetLoading = false;
        }
      });
  }

  selectVet(option: SearchableSelectOption) {
    this.newAppointment.veterinarianId = option.id;
    this.selectedVetLabel = option.label;
    this.createError = '';
  }

  clearVetSelection() {
    this.newAppointment.veterinarianId = null;
    this.selectedVetLabel = '';
  }

  searchRescheduleVets(term: string) {
    this.rescheduleVetLoading = true;

    this.vetService.getVets(term.trim() || undefined, undefined, undefined, 0, 15)
      .subscribe({
        next: (res) => {
          this.rescheduleVetOptions = this.mapVetOptions(res.data || []);
          this.rescheduleVetLoading = false;
        },
        error: () => {
          this.rescheduleVetOptions = [];
          this.rescheduleVetLoading = false;
        }
      });
  }

  selectRescheduleVet(option: SearchableSelectOption) {
    this.newRescheduleVetId = option.id;
    this.selectedRescheduleVetLabel = option.label;
  }

  clearRescheduleVetSelection() {
    this.newRescheduleVetId = undefined;
    this.selectedRescheduleVetLabel = '';
  }

  private loadClientLabel(clientId: number) {
    this.clientService.getById(clientId)
      .subscribe({
        next: (res) => {
          this.selectedClientLabel = res.data ? this.formatClientLabel(res.data) : `Cliente #${clientId}`;
        },
        error: () => {
          this.selectedClientLabel = `Cliente #${clientId}`;
        }
      });
  }

  private mapVetOptions(vets: Veterinarian[]): SearchableSelectOption[] {
    return vets.map(vet => ({
      id: vet.userId,
      label: `${vet.name} ${vet.lastName}`.trim() || vet.email,
      description: `${vet.email} - ${vet.specialty || 'Sin especialidad'}`,
      metadata: { vet }
    }));
  }

  private formatClientLabel(client: Client): string {
    return `${client.firstName} ${client.lastName}`.trim() || client.email;
  }
}
