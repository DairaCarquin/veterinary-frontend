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

  authService;
  router;

  constructor(authService: AuthService, router: Router) {
    this.authService = authService;
    this.router = router;
  }

  login() {
    const user = this.authService.login(this.username, this.password);

    if (!user) {
      this.error = 'Usuario o contraseña incorrectos';
      return;
    }

    if (user.role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (user.role === 'VETERINARIO') {
      this.router.navigate(['/veterinario']);
    } else if (user.role === 'CLIENTE') {
      this.router.navigate(['/cliente']);
    }
  }
}
