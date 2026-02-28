import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService, Role } from '../../../service/role.service';
import { DynamicTableComponent, TableColumn, TableAction } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-roles',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  constructor(private roleService: RoleService) { }

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
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
    { key: 'name', label: 'Nombre', placeholder: 'Buscar rol' }
  ];

  roles: Role[] = [];
  selectedRole: any = null;

  showCreateModal = false;
  showEditModal = false;
  showConfirmModal = false;

  page = 0;
  size = 10;
  total = 0;

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(filters?: any) {
    this.roleService
      .getRoles(filters?.name, this.page, this.size)
      .subscribe(res => {
        this.roles = res.data;
        this.total = res.total;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadRoles();
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadRoles();
  }

  handleAction(event: { action: string, row: any }) {

    if (event.action === 'edit') {
      this.selectedRole = { ...event.row };
      this.showEditModal = true;
    }

    if (event.action === 'toggle') {
      this.selectedRole = event.row;
      this.showConfirmModal = true;
    }
  }

  openCreateModal() {
    this.selectedRole = { name: '' };
    this.showCreateModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showConfirmModal = false;
    this.selectedRole = null;
  }

  createRole() {
    this.roleService.create(this.selectedRole)
      .subscribe(() => {
        this.closeModals();
        this.loadRoles();
      });
  }

  updateRole() {
    this.roleService.update(this.selectedRole.id, this.selectedRole)
      .subscribe(() => {
        this.closeModals();
        this.loadRoles();
      });
  }

  confirmToggle() {
    this.roleService.toggle(
      this.selectedRole.id,
      !this.selectedRole.enabled
    ).subscribe(() => {
      this.closeModals();
      this.loadRoles();
    });
  }
}
