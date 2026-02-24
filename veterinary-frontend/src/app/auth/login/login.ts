import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  username = '';
  password = '';
  error = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  login() {
    this.error = '';

    const result = this.authService.login(this.username, this.password);

    if (!result) {
      this.error = 'Usuario o contraseña incorrectos';
      return;
    }

    const roles = result.roles || [];

    if (roles.includes('ADMIN')) {
      this.router.navigate(['/admin']);
      return;
    }

    if (roles.includes('VETERINARIO')) {
      this.router.navigate(['/veterinario']);
      return;
    }

    if (roles.includes('CLIENTE')) {
      this.router.navigate(['/cliente']);
      return;
    }

    // Si por alguna razón no hay rol conocido, regresamos al login
    this.error = 'Rol de usuario no reconocido en el mock';
  }
}
