import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../service/client.service';
import { DynamicTableComponent, TableAction, TableColumn } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from "@angular/material/icon";

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
    { key: 'phone', label: 'Teléfono' },
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

  constructor(private readonly clientService: ClientService) { }

  ngOnInit(): void {
    this.loadClients();
  }

  filters = [
    { key: 'name', label: 'Nombre', placeholder: 'Buscar por nombre' },
    { key: 'dni', label: 'DNI', placeholder: 'Buscar por DNI' }
  ];

  page = 0;
  size = 10;
  total = 0;

  loadClients(filters?: any) {
    this.clientService
      .getClients(filters?.name, filters?.dni, this.page, this.size)
      .subscribe(res => {

        this.clients = res.data.map(c => ({
          ...c,
          fullName: `${c.firstName ?? ''} ${c.lastName ?? ''}`
        }));

        this.total = res.data.length;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadClients();
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadClients();
  }

  handleAction(event: { action: string, row: any }) {

    if (event.action === 'edit') {
      this.openEditModal(event.row);
    }

    if (event.action === 'toggle') {
      this.openConfirmModal(event.row);
    }

  }

  selectedClient: any = null;

  showEditModal = false;
  showConfirmModal = false;

  openEditModal(client: any) {
    this.selectedClient = { ...client };
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
  }

  updateClient() {
    if (!this.selectedClient) return;

    this.clientService.update(
      this.selectedClient.id,
      this.selectedClient
    ).subscribe(() => {
      this.closeModals();
      this.loadClients();
    });
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
}
