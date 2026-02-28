import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../service/user.service';
import { DynamicTableComponent, TableColumn, TableAction } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule, DynamicTableComponent, MatIcon],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  constructor(private userService: UserService) { }

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Usuario' },
    { key: 'roleDisplay', label: 'Rol ID' },
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
    { key: 'username', label: 'Usuario', placeholder: 'Buscar usuario' },
    { key: 'roleId', label: 'Rol ID', placeholder: 'Buscar rol' }
  ];

  users: any[] = [];
  selectedUser: any = null;

  showEditModal = false;
  showConfirmModal = false;

  page = 0;
  size = 10;
  total = 0;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(filters?: any) {

    this.userService
      .getUsers(filters?.username, filters?.roleId, this.page, this.size)
      .subscribe(res => {

        this.users = res.data.map(u => ({
          ...u,
          roleDisplay: `${u.roleId} - ${this.roleMap[u.roleId] ?? 'Desconocido'}`
        }));

        this.total = res.total ?? res.data.length;

      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadUsers();
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadUsers();
  }

  handleAction(event: { action: string, row: any }) {

    if (event.action === 'edit') {
      this.selectedUser = { ...event.row };
      this.showEditModal = true;
    }

    if (event.action === 'toggle') {
      this.selectedUser = event.row;
      this.showConfirmModal = true;
    }
  }

  showCreateModal = false;
  newUser: any = {
    username: '',
    password: '',
    role: ''
  };

  openCreateModal() {
    this.newUser = {
      username: '',
      password: '',
      role: ''
    };
    this.showCreateModal = true;
  }

  closeModals() {
    this.showEditModal = false;
    this.showConfirmModal = false;
    this.showCreateModal = false;
    this.selectedUser = null;
  }

  createUser() {

    if (!this.newUser.username ||
      !this.newUser.password ||
      !this.newUser.role) {
      return;
    }

    this.userService.register(this.newUser)
      .subscribe(() => {
        this.closeModals();
        this.loadUsers();
      });
  }

  updateUser() {

    this.userService.update(
      this.selectedUser.id,
      this.selectedUser
    ).subscribe(() => {
      this.closeModals();
      this.loadUsers();
    });
  }

  confirmToggle() {

    this.userService.toggle(
      this.selectedUser.id,
      !this.selectedUser.enabled
    ).subscribe(() => {
      this.closeModals();
      this.loadUsers();
    });
  }

  roleMap: Record<number, string> = {
    1: 'ADMIN',
    2: 'CLIENT',
    3: 'VETERINARY'
  };

}
