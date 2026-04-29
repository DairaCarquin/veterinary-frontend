import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
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
import { AuthService } from '../../../service/auth.service';

@Component({
  standalone: true,
  selector: 'app-citas',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon, SearchableSelectComponent],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit, OnDestroy {

  constructor(
    private appointmentService: AppointmentService,
    private petService: PetService,
    private clientService: ClientService,
    private vetService: VetService,
    private authService: AuthService
  ) { }

  readonly role = this.authService.getRole();

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'petId', label: 'Mascota' },
    { key: 'clientId', label: 'Cliente' },
    { key: 'veterinarianId', label: 'Veterinario' },
    { key: 'appointmentDateDisplay', label: 'Fecha' },
    { key: 'statusDisplay', label: 'Estado' },
    { key: 'enabledDisplay', label: 'Activo' }
  ];

  appointments: Appointment[] = [];
  selectedAppointment: any = null;
  createError = '';
  rescheduleError = '';
  statusError = '';
  showErrorPopup = false;
  errorPopupTitle = 'No se pudo completar la accion';
  errorPopupMessage = '';

  showStatusModal = false;
  showRescheduleModal = false;
  showConfirmModal = false;
  showCreateModal = false;
  showStartPrompt = false;

  dueAppointment: any = null;
  private duePromptDismissedForId: number | null = null;
  private dueCheckSubscription?: Subscription;

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

  readonly baseFilters = [
    { key: 'petId', label: 'Mascota', placeholder: 'Pet ID' },
    { key: 'status', label: 'Estado', placeholder: 'PENDING, IN_PROGRESS...' },
    { key: 'date', label: 'Dia', placeholder: 'YYYY-MM-DD' }
  ];

  readonly adminFilters = [
    ...this.baseFilters,
    { key: 'veterinarianId', label: 'Veterinario', placeholder: 'Vet ID' }
  ];

  ngOnInit(): void {
    this.loadAppointments();

    if (this.role === 'VETERINARY') {
      this.dueCheckSubscription = interval(30000)
        .subscribe(() => this.checkDueAppointments());
    }
  }

  ngOnDestroy(): void {
    this.dueCheckSubscription?.unsubscribe();
  }

  get actions(): TableAction[] {
    const canManageState = this.role === 'ADMIN' || this.role === 'VETERINARY';
    const canToggle = this.role === 'ADMIN';

    return [
      {
        name: 'status',
        icon: 'sync',
        color: '#dbeafe',
        iconColor: '#2563eb',
        visible: canManageState,
        disabled: (row) => this.isPaidAppointment(row)
      },
      {
        name: 'reschedule',
        icon: 'event',
        color: '#fef3c7',
        iconColor: '#d97706',
        visible: true,
        disabled: (row) => !this.isPendingAppointment(row)
      },
      {
        name: 'toggle',
        icon: 'toggle_on',
        color: '#fee2e2',
        iconColor: '#dc2626',
        visible: canToggle,
        disabled: (row) => !this.isPendingAppointment(row)
      }
    ];
  }

  get filters() {
    return this.role === 'ADMIN' ? this.adminFilters : this.baseFilters;
  }

  get canShowActions(): boolean {
    return this.actions.some(action => action.visible !== false);
  }

  get statusOptions(): string[] {
    const currentStatus = (this.selectedAppointment?.status ?? '').toUpperCase();

    switch (currentStatus) {
      case 'PENDING':
      case 'RESCHEDULED':
        return ['IN_PROGRESS', 'CANCELLED'];
      case 'IN_PROGRESS':
        return ['ATTENDED', 'RESCHEDULED', 'CANCELLED'];
      case 'ATTENDED':
        return ['PAID'];
      default:
        return [];
    }
  }

  loadAppointments(filters?: any) {
    this.currentFilters = filters ?? this.currentFilters;

    this.appointmentService
      .getAppointments(
        this.toNumber(this.currentFilters?.petId),
        this.role === 'ADMIN' ? this.toNumber(this.currentFilters?.veterinarianId) : undefined,
        this.currentFilters?.status?.trim() || undefined,
        this.parseDateFilter(this.currentFilters?.date),
        this.page,
        this.size
      )
      .subscribe({
        next: (res) => {
          this.appointments = res.data.map(appointment => ({
            ...appointment,
            appointmentDateDisplay: formatDateTime(appointment.appointmentDate),
            statusDisplay: appointmentStatusBadge(appointment.status),
            enabledDisplay: booleanBadge(!!appointment.enabled)
          }));
          this.total = res.total;

          if (this.role === 'VETERINARY') {
            this.checkDueAppointments();
          }
        },
        error: (error) => {
          this.appointments = [];
          this.total = 0;
          this.openErrorPopup('No se pudo cargar citas', this.getErrorMessage(error, 'No se pudo cargar el modulo de citas.'));
        }
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
    if (event.action === 'status' && this.isPaidAppointment(event.row)) {
      return;
    }

    if (['reschedule', 'toggle'].includes(event.action) && !this.isPendingAppointment(event.row)) {
      return;
    }

    if (event.action === 'status') {
      this.selectedAppointment = event.row;
      this.selectedStatus = this.statusOptions[0] ?? '';
      this.statusError = '';
      this.showStatusModal = true;
    }

    if (event.action === 'reschedule') {
      this.openRescheduleModal(event.row);
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
      appointmentDate: this.toLocalDateTimeForApi(this.newAppointment.appointmentDate),
      reason: this.newAppointment.reason.trim()
    };

    this.appointmentService.create(payload)
      .subscribe({
        next: () => {
          this.closeModals();
          this.loadAppointments();
        },
        error: (error) => {
          const message = this.getErrorMessage(error, 'No se pudo crear la cita.');
          this.openErrorPopup('No se pudo crear la cita', message);
          this.createError = message;
        }
      });
  }

  updateStatus() {
    if (!this.selectedStatus) {
      this.statusError = 'Selecciona un estado valido para continuar.';
      return;
    }

    this.appointmentService
      .updateStatus(this.selectedAppointment.id, this.selectedStatus)
      .subscribe({
        next: () => {
          this.closeModals();
          this.loadAppointments();
        },
        error: (error) => {
          const message = this.getErrorMessage(error, 'No se pudo actualizar el estado.');
          this.statusError = message;
          this.openErrorPopup('No se pudo actualizar el estado', message);
        }
      });
  }

  confirmReschedule() {
    if (!this.newRescheduleDate) {
      this.rescheduleError = 'Selecciona una nueva fecha antes de reprogramar.';
      return;
    }

    this.rescheduleError = '';

    const appointmentDate = this.toLocalDateTimeForApi(this.newRescheduleDate);

    this.appointmentService
      .reschedule(
        this.selectedAppointment.id,
        appointmentDate,
        this.newRescheduleVetId
      )
      .subscribe({
        next: () => {
          this.closeModals();
          this.loadAppointments();
        },
        error: (error) => {
          const message = this.getErrorMessage(error, 'No se pudo reprogramar la cita.');
          this.rescheduleError = message;
          this.openErrorPopup('No se pudo reprogramar la cita', message);
        }
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

  openCustomRescheduleFromPrompt() {
    if (!this.dueAppointment) {
      return;
    }

    this.showStartPrompt = false;
    this.openRescheduleModal(this.dueAppointment);
  }

  snoozeDueAppointment() {
    if (!this.dueAppointment) {
      return;
    }

    const baseDate = new Date(this.dueAppointment.appointmentDate);
    baseDate.setMinutes(baseDate.getMinutes() + 5);

    this.appointmentService.reschedule(this.dueAppointment.id, this.formatLocalDateTime(baseDate))
      .subscribe({
        next: () => {
          this.duePromptDismissedForId = null;
          this.showStartPrompt = false;
          this.dueAppointment = null;
          this.loadAppointments();
        },
        error: (error) => {
          const message = this.getErrorMessage(error, 'No se pudo mover la cita 5 minutos.');
          this.openErrorPopup('No se pudo reprogramar la cita', message);
        }
      });
  }

  startDueAppointment() {
    if (!this.dueAppointment) {
      return;
    }

    this.appointmentService.updateStatus(this.dueAppointment.id, 'IN_PROGRESS')
      .subscribe({
        next: () => {
          this.showStartPrompt = false;
          this.dueAppointment = null;
          this.loadAppointments();
        },
        error: (error) => {
          this.openErrorPopup('No se pudo iniciar la cita', this.getErrorMessage(error, 'No se pudo iniciar la cita.'));
        }
      });
  }

  closeStartPrompt() {
    this.duePromptDismissedForId = this.dueAppointment?.id ?? null;
    this.showStartPrompt = false;
  }

  closeModals() {
    this.showStatusModal = false;
    this.showRescheduleModal = false;
    this.showConfirmModal = false;
    this.showCreateModal = false;
    this.selectedAppointment = null;
    this.createError = '';
    this.rescheduleError = '';
    this.statusError = '';
    this.selectedPetLabel = '';
    this.selectedClientLabel = '';
    this.selectedVetLabel = '';
    this.selectedRescheduleVetLabel = '';
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

    if (this.role === 'CLIENT') {
      this.selectedClientLabel = 'Mi cuenta';
      return;
    }

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

  closeErrorPopup() {
    this.showErrorPopup = false;
    this.errorPopupMessage = '';
  }

  private openRescheduleModal(appointment: any) {
    this.selectedAppointment = appointment;
    this.newRescheduleDate = '';
    this.newRescheduleVetId = undefined;
    this.selectedRescheduleVetLabel = '';
    this.rescheduleError = '';
    this.rescheduleVetOptions = [];
    this.searchRescheduleVets('');
    this.showRescheduleModal = true;
  }

  private checkDueAppointments() {
    if (this.role !== 'VETERINARY' || this.showStartPrompt || this.showRescheduleModal || this.showStatusModal) {
      return;
    }

    const now = new Date();
    const due = this.appointments
      .filter(appointment => appointment.enabled && ['PENDING', 'RESCHEDULED'].includes(appointment.status))
      .find(appointment => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return appointmentDate.getTime() <= now.getTime()
          && appointment.id !== this.duePromptDismissedForId;
      });

    if (due) {
      this.dueAppointment = {
        ...due,
        appointmentDateDisplay: formatDateTime(due.appointmentDate)
      };
      this.showStartPrompt = true;
    }
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

  private openErrorPopup(title: string, message: string) {
    this.errorPopupTitle = title;
    this.errorPopupMessage = message;
    this.showErrorPopup = true;
  }

  private getErrorMessage(error: any, fallback: string): string {
    const payloadMessage = error?.error?.message;
    if (typeof payloadMessage === 'string' && payloadMessage.trim()) {
      return payloadMessage;
    }

    if (typeof error?.message === 'string' && error.message.trim()) {
      return error.message;
    }

    return fallback;
  }

  private toNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private parseDateFilter(value: unknown): string | undefined {
    if (typeof value !== 'string' || !value.trim()) {
      return undefined;
    }

    const date = value.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : undefined;
  }

  private toLocalDateTimeForApi(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }

  private isPendingAppointment(appointment: any): boolean {
    return (appointment?.status ?? '').toUpperCase() === 'PENDING';
  }

  private isPaidAppointment(appointment: any): boolean {
    return (appointment?.status ?? '').toUpperCase() === 'PAID';
  }

  private formatLocalDateTime(date: Date): string {
    const pad = (part: number) => part.toString().padStart(2, '0');

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
