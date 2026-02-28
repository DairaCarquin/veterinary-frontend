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
    private authService: AuthService,
    public router: Router
  ) { }

  menuItems = [
    { label: 'Dashboard', route: '/admin', icon: 'dashboard', roles: ['ADMIN'] },
    { label: 'Dashboard', route: '/veterinario', icon: 'dashboard', roles: ['VETERINARY'] },
    { label: 'Dashboard', route: '/cliente', icon: 'dashboard', roles: ['CLIENT'] },

    { label: 'Usuarios', route: '/admin/usuarios', icon: 'people', roles: ['ADMIN'] },
    { label: 'Roles', route: '/admin/roles', icon: 'category', roles: ['ADMIN'] },

    { label: 'Clientes', route: '/admin/clientes', icon: 'groups', roles: ['ADMIN'] },
    { label: 'Mascotas', route: '/admin/mascotas', icon: 'pets', roles: ['ADMIN'] },
    { label: 'Veterinarios', route: '/admin/veterinarios', icon: 'medical_services', roles: ['ADMIN'] },
    { label: 'Citas', route: '/admin/citas', icon: 'event_note', roles: ['ADMIN', 'CLIENT', 'VETERINARY'] },

    { label: 'Historial Médico', route: '/admin/historial', icon: 'description', roles: ['ADMIN'] },

    { label: 'Calendario', route: '/calendario', icon: 'calendar_month', roles: ['ADMIN', 'CLIENT', 'VETERINARY'] },
  ];

  get filteredMenu() {
    const role = this.authService.getRole();
    return this.menuItems.filter(item =>
      item.roles.includes(role ?? '')
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // navigate(route: string) {
  //   this.router.navigate([route]);
  // }

  // isActive(route: string): boolean {
  //   if (route === '/admin' || route === '/cliente' || route === '/veterinario') {
  //     return this.router.url === route;
  //   }

  //   return this.router.url.startsWith(route);
  // }
}
