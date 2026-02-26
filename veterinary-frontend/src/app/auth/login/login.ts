import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
    this.authService
      .login(this.username, this.password)
      .pipe(
        catchError(() => {
          this.error = 'Usuario o contraseña incorrectos';
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }

        const role = result.role?.toUpperCase() ?? '';

        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
          return;
        }

        if (role === 'VETERINARY' || role === 'VETERINARIO') {
          this.router.navigate(['/veterinario']);
          return;
        }

        if (role === 'CLIENT') {
          this.router.navigate(['/cliente']);
          return;
        }

        this.error = 'Rol de usuario no reconocido.';
      });
  }
}
