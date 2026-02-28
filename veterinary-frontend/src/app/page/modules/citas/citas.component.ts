import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, Appointment } from '../../../service/appointment.service';
import { DynamicTableComponent, TableColumn, TableAction } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-citas',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit {

  constructor(private appointmentService: AppointmentService) { }

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
    this.loadAppointments();
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
    this.newAppointment = {
      petId: null,
      clientId: null,
      veterinarianId: null,
      appointmentDate: ''
    };
    this.showCreateModal = true;
  }

  createAppointment() {

    const payload = {
      ...this.newAppointment,
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
