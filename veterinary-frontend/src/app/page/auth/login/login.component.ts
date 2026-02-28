import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  login() {
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        const role = response.data.role;

        switch (role) {
          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;

          case 'CLIENT':
            this.router.navigate(['/cliente']);
            break;

          case 'VETERINARY':
            this.router.navigate(['/veterinario']);
            break;

          default:
            this.error = 'Rol no reconocido';
        }
      },
      error: () => {
        this.error = 'Usuario o contraseña incorrectos';
      }
    });
  }
}
