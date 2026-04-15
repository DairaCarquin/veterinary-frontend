import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService, Role } from '../../../service/role.service';
import { DynamicTableComponent, TableColumn, TableAction } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from '@angular/material/icon';
import { booleanBadge } from '../../../utils/table-display.util';
import {
  hasDigits,
  hasInvalidNameCharacters,
  isValidName
} from '../../../utils/form-validation.util';

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
    { key: 'id', label: 'Código', placeholder: 'Buscar código' },
    { key: 'name', label: 'Nombre', placeholder: 'Buscar rol' }
  ];

  roles: Role[] = [];
  selectedRole: any = null;

  showCreateModal = false;
  showEditModal = false;
  showConfirmModal = false;
  createRoleError = '';
  editRoleError = '';
  submittedCreate = false;
  submittedEdit = false;
  touchedCreateFields: Record<string, boolean> = {};
  touchedEditFields: Record<string, boolean> = {};

  page = 0;
  size = 10;
  total = 0;
  currentFilters: any = {};

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(filters?: any) {
    this.currentFilters = filters ?? this.currentFilters;
    this.roleService
      .getRoles(this.currentFilters?.id, this.currentFilters?.name, this.page, this.size)
      .subscribe(res => {
        this.roles = res.data.map(role => ({
          ...role,
          enabledDisplay: booleanBadge(!!role.enabled)
        }));
        this.total = res.total;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadRoles(this.currentFilters);
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadRoles(this.currentFilters);
  }

  handleAction(event: { action: string, row: any }) {

    if (event.action === 'edit') {
      this.selectedRole = { ...event.row };
      this.editRoleError = '';
      this.submittedEdit = false;
      this.touchedEditFields = {};
      this.showEditModal = true;
    }

    if (event.action === 'toggle') {
      this.selectedRole = event.row;
      this.showConfirmModal = true;
    }
  }

  openCreateModal() {
    this.selectedRole = { name: '' };
    this.createRoleError = '';
    this.submittedCreate = false;
    this.touchedCreateFields = {};
    this.showCreateModal = true;
  }

  closeModals() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showConfirmModal = false;
    this.createRoleError = '';
    this.editRoleError = '';
    this.submittedCreate = false;
    this.submittedEdit = false;
    this.touchedCreateFields = {};
    this.touchedEditFields = {};
    this.selectedRole = null;
  }

  onCreateNameChange(value: string) {
    this.touchedCreateFields['name'] = true;
    this.selectedRole.name = value ?? '';
    this.createRoleError = this.getRoleNameError(this.selectedRole?.name);
  }

  onEditNameChange(value: string) {
    this.touchedEditFields['name'] = true;
    this.selectedRole.name = value ?? '';
    this.editRoleError = this.getRoleNameError(this.selectedRole?.name);
  }

  createRole() {
    this.submittedCreate = true;
    const error = this.getRoleNameError(this.selectedRole?.name);

    if (error) {
      this.createRoleError = error;
      return;
    }

    this.roleService.create(this.selectedRole)
      .subscribe(() => {
        this.closeModals();
        this.loadRoles();
      });
  }

  updateRole() {
    this.submittedEdit = true;
    const error = this.getRoleNameError(this.selectedRole?.name);

    if (error) {
      this.editRoleError = error;
      return;
    }

    this.roleService.update(this.selectedRole.id, this.selectedRole)
      .subscribe(() => {
        this.closeModals();
        this.loadRoles();
      });
  }

  hasCreateNameError(): boolean {
    return (!!this.touchedCreateFields['name'] || this.submittedCreate) && !!this.getRoleNameError(this.selectedRole?.name);
  }

  hasEditNameError(): boolean {
    return (!!this.touchedEditFields['name'] || this.submittedEdit) && !!this.getRoleNameError(this.selectedRole?.name);
  }

  canCreateRole(): boolean {
    return !this.getRoleNameError(this.selectedRole?.name);
  }

  canUpdateRole(): boolean {
    return !this.getRoleNameError(this.selectedRole?.name);
  }

  private getRoleNameError(value: string): string {
    const roleName = value ?? '';

    if (!roleName.trim()) {
      return 'El nombre del rol es obligatorio.';
    }

    if (hasDigits(roleName)) {
      return 'El nombre del rol no puede contener numeros.';
    }

    if (hasInvalidNameCharacters(roleName)) {
      return 'El nombre del rol no puede contener caracteres especiales.';
    }

    if (!isValidName(roleName)) {
      return 'El nombre del rol solo puede contener letras.';
    }

    return '';
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
