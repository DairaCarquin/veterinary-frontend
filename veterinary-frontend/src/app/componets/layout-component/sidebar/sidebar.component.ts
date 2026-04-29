import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {

  constructor(
    private readonly authService: AuthService,
    public router: Router
  ) { }

  menuItems = [
    { label: 'Dashboard', route: '/admin', icon: 'dashboard', roles: ['ADMIN'] },
    { label: 'Usuarios', route: '/admin/usuarios', icon: 'people', roles: ['ADMIN'] },
    { label: 'Roles', route: '/admin/roles', icon: 'category', roles: ['ADMIN'] },
    { label: 'Clientes', route: '/admin/clientes', icon: 'groups', roles: ['ADMIN'] },
    { label: 'Mascotas', route: '/admin/mascotas', icon: 'pets', roles: ['ADMIN'] },
    { label: 'Veterinarios', route: '/admin/veterinarios', icon: 'medical_services', roles: ['ADMIN'] },
    { label: 'Citas', route: '/admin/citas', icon: 'event_note', roles: ['ADMIN'] },
    { label: 'Historial médico', route: '/admin/historial', icon: 'description', roles: ['ADMIN'] },

    { label: 'Dashboard', route: '/veterinario', icon: 'dashboard', roles: ['VETERINARY'] },
    { label: 'Mi agenda', route: '/veterinario/citas', icon: 'calendar_month', roles: ['VETERINARY'] },
    { label: 'Historial médico', route: '/veterinario/historial', icon: 'description', roles: ['VETERINARY'] },

    { label: 'Dashboard', route: '/cliente', icon: 'dashboard', roles: ['CLIENT'] },
    { label: 'Mis mascotas', route: '/cliente/mascotas', icon: 'pets', roles: ['CLIENT'] },
    { label: 'Mis citas', route: '/cliente/citas', icon: 'event_note', roles: ['CLIENT'] },
    { label: 'Historial médico', route: '/cliente/historial', icon: 'description', roles: ['CLIENT'] },
  ];

  get filteredMenu() {
    const role = this.authService.getRole();
    return this.menuItems.filter(item => item.roles.includes(role ?? ''));
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
