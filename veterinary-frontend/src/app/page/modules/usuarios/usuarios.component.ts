import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../service/user.service';
import { DynamicTableComponent, TableAction, TableColumn } from '../../../componets/dynamic-table/dynamic-table.component';
import { MatIcon } from '@angular/material/icon';
import { RegisterUserPayload } from '../../../service/models/user.model';
import { TableFilter } from '../../../componets/dynamic-table/dynamic-table.component';
import {
  hasDigits,
  hasInvalidNameCharacters,
  hasLetters,
  hasMinPasswordLength,
  hasNumber,
  hasSpecialCharacters,
  hasSpecialCharacter,
  hasUppercase,
  hasWhitespace,
  isMasterdogEmail,
  isStrongPassword,
  isValidName,
  isValidDni,
  isValidPhone,
  normalizeEmail
} from '../../../utils/form-validation.util';
import { booleanBadge } from '../../../utils/table-display.util';

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
    { key: 'username', label: 'Email' },
    { key: 'roleDisplay', label: 'Rol' },
    { key: 'enabledDisplay', label: 'Activo' }
  ];

  actions: TableAction[] = [
    {
      name: 'toggle',
      icon: 'toggle_on',
      color: '#fee2e2',
      iconColor: '#dc2626'
    }
  ];

  filters: TableFilter[] = [
    { key: 'username', label: 'Email', placeholder: 'Buscar correo @masterdog.com' },
    {
      key: 'roleId',
      label: 'Rol',
      type: 'select',
      placeholder: 'Seleccione rol',
      options: [
        { value: 1, label: '1 - ADMIN' },
        { value: 2, label: '2 - CLIENT' },
        { value: 3, label: '3 - VETERINARY' }
      ]
    }
  ];

  users: any[] = [];
  selectedUser: any = null;
  showConfirmModal = false;
  showCreateModal = false;
  createError = '';
  submittedCreate = false;
  createFieldErrors: Record<string, string> = {};
  touchedCreateFields: Record<string, boolean> = {};
  passwordFocused = false;

  page = 0;
  size = 10;
  total = 0;
  currentFilters: any = {};

  newUser: RegisterUserPayload = this.createEmptyUser();

  ngOnInit(): void {
    this.loadUsers();
  }

  private createEmptyUser(): RegisterUserPayload {
    return {
      email: '',
      password: '',
      role: '',
      firstName: '',
      lastName: '',
      dni: '',
      phone: ''
    };
  }

  loadUsers(filters?: any) {
    this.currentFilters = filters ?? this.currentFilters;
    this.userService
      .getUsers(this.currentFilters?.username, this.currentFilters?.roleId, this.page, this.size)
      .subscribe(res => {
        this.users = res.data.map(u => ({
          ...u,
          roleDisplay: `${u.roleId} - ${this.roleMap[u.roleId] ?? 'Desconocido'}`,
          enabledDisplay: booleanBadge(!!u.enabled)
        }));
        this.total = res.total ?? res.data.length;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadUsers(this.currentFilters);
  }

  onSizeChange(newSize: number) {
    this.size = newSize;
    this.page = 0;
    this.loadUsers(this.currentFilters);
  }

  handleAction(event: { action: string, row: any }) {
    if (event.action === 'toggle') {
      this.selectedUser = event.row;
      this.showConfirmModal = true;
    }
  }

  openCreateModal() {
    this.newUser = this.createEmptyUser();
    this.createError = '';
    this.submittedCreate = false;
    this.createFieldErrors = {};
    this.touchedCreateFields = {};
    this.passwordFocused = false;
    this.showCreateModal = true;
  }

  closeModals() {
    this.showConfirmModal = false;
    this.showCreateModal = false;
    this.selectedUser = null;
    this.createError = '';
    this.createFieldErrors = {};
    this.submittedCreate = false;
    this.touchedCreateFields = {};
    this.passwordFocused = false;
  }

  onEmailChange(value: string) {
    this.markCreateFieldTouched('email');
    this.newUser.email = normalizeEmail(value);
    this.refreshCreateValidation();
  }

  onPasswordChange(value: string) {
    this.markCreateFieldTouched('password');
    this.newUser.password = value ?? '';
    this.refreshCreateValidation();
  }

  onPasswordFocus() {
    this.passwordFocused = true;
  }

  onPasswordBlur() {
    this.passwordFocused = false;
  }

  onNameChange(field: 'firstName' | 'lastName', value: string) {
    this.markCreateFieldTouched(field);
    this.newUser[field] = value ?? '';
    this.refreshCreateValidation();
  }

  onDigitsChange(field: 'dni' | 'phone', value: string, maxLength: number) {
    this.markCreateFieldTouched(field);
    this.newUser[field] = (value ?? '').slice(0, maxLength);
    this.refreshCreateValidation();
  }

  createUser() {
    this.submittedCreate = true;
    this.createFieldErrors = this.validateCreateUser();

    if (Object.keys(this.createFieldErrors).length > 0) {
      this.createError = 'Corrige los campos marcados antes de continuar.';
      return;
    }

    this.userService.register(this.newUser)
      .subscribe({
        next: () => {
          this.closeModals();
          this.loadUsers();
        },
        error: (error) => {
          const fields = error?.error?.fields;
          if (fields) {
            this.createFieldErrors = fields;
            this.createError = 'Corrige los campos marcados antes de continuar.';
            return;
          }

          this.createError = error?.error?.message ?? 'No se pudo crear el usuario.';
        }
      });
  }

  canCreateUser(): boolean {
    return Object.keys(this.validateCreateUser()).length === 0;
  }

  getCreateFieldError(field: string): string {
    return this.createFieldErrors[field] ?? '';
  }

  hasCreateFieldError(field: string): boolean {
    return this.shouldShowCreateFieldError(field) && !!this.getLiveCreateFieldError(field);
  }

  getLiveCreateFieldError(field: string): string {
    return this.validateCreateUser()[field] ?? '';
  }

  shouldShowCreateFieldError(field: string): boolean {
    return !!this.touchedCreateFields[field] || this.submittedCreate;
  }

  markCreateFieldTouched(field: string) {
    this.touchedCreateFields[field] = true;
  }

  get passwordChecks() {
    const password = this.newUser.password ?? '';

    return [
      {
        label: 'Minimo 8 caracteres',
        valid: hasMinPasswordLength(password)
      },
      {
        label: 'Al menos una mayuscula',
        valid: hasUppercase(password)
      },
      {
        label: 'Al menos un numero',
        valid: hasNumber(password)
      },
      {
        label: 'Al menos un caracter especial',
        valid: hasSpecialCharacter(password)
      }
    ];
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

  public refreshCreateValidation() {
    if (!this.submittedCreate && Object.keys(this.touchedCreateFields).length === 0) {
      return;
    }

    this.createFieldErrors = this.validateCreateUser();
  }

  private validateCreateUser(): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!this.newUser.email) {
      errors['email'] = 'El email es obligatorio.';
    } else if (hasWhitespace(this.newUser.email)) {
      errors['email'] = 'El email no puede contener espacios.';
    } else if (!isMasterdogEmail(this.newUser.email)) {
      errors['email'] = 'El email debe terminar en @masterdog.com.';
    }

    if (!this.newUser.password) {
      errors['password'] = 'La contrasena es obligatoria.';
    } else if (!isStrongPassword(this.newUser.password)) {
      errors['password'] = 'Debe incluir mayuscula, numero y caracter especial.';
    }

    if (!this.newUser.role) {
      errors['role'] = 'Selecciona un rol.';
    }

    if (!this.newUser.firstName.trim()) {
      errors['firstName'] = 'El nombre es obligatorio.';
    } else if (hasDigits(this.newUser.firstName)) {
      errors['firstName'] = 'El nombre no puede contener numeros.';
    } else if (hasInvalidNameCharacters(this.newUser.firstName)) {
      errors['firstName'] = 'El nombre no puede contener caracteres especiales.';
    } else if (!isValidName(this.newUser.firstName)) {
      errors['firstName'] = 'El nombre solo puede contener letras.';
    }

    if (!this.newUser.lastName.trim()) {
      errors['lastName'] = 'El apellido es obligatorio.';
    } else if (hasDigits(this.newUser.lastName)) {
      errors['lastName'] = 'El apellido no puede contener numeros.';
    } else if (hasInvalidNameCharacters(this.newUser.lastName)) {
      errors['lastName'] = 'El apellido no puede contener caracteres especiales.';
    } else if (!isValidName(this.newUser.lastName)) {
      errors['lastName'] = 'El apellido solo puede contener letras.';
    }

    if (!this.newUser.dni) {
      errors['dni'] = 'El DNI es obligatorio.';
    } else if (hasWhitespace(this.newUser.dni)) {
      errors['dni'] = 'El DNI no puede contener espacios.';
    } else if (hasLetters(this.newUser.dni)) {
      errors['dni'] = 'El DNI no puede contener letras.';
    } else if (hasSpecialCharacters(this.newUser.dni)) {
      errors['dni'] = 'El DNI no puede contener caracteres especiales.';
    } else if (!isValidDni(this.newUser.dni)) {
      errors['dni'] = 'El DNI debe tener 8 digitos.';
    }

    if (!this.newUser.phone) {
      errors['phone'] = 'El telefono es obligatorio.';
    } else if (hasWhitespace(this.newUser.phone)) {
      errors['phone'] = 'El telefono no puede contener espacios.';
    } else if (hasLetters(this.newUser.phone)) {
      errors['phone'] = 'El telefono no puede contener letras.';
    } else if (hasSpecialCharacters(this.newUser.phone)) {
      errors['phone'] = 'El telefono no puede contener caracteres especiales.';
    } else if (!isValidPhone(this.newUser.phone)) {
      errors['phone'] = 'El telefono debe tener 9 digitos.';
    }

    return errors;
  }

  roleMap: Record<number, string> = {
    1: 'ADMIN',
    2: 'CLIENT',
    3: 'VETERINARY'
  };
}
