import { Routes } from '@angular/router';
import { MainLayoutComponent } from './componets/layout-component/main-layout/main-layout.component';
import { LoginComponent } from './page/auth/login/login.component';
import { authGuard, roleGuard } from './service/auth.guard';


export const routes: Routes = [

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [

      {
        path: 'admin',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./page/modules/dashboard/admin/admin.component')
            .then(m => m.AdminComponent)
      },
      {
        path: 'admin/usuarios',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./page/modules/usuarios/usuarios.component')
            .then(m => m.UsuariosComponent)
      },
      {
        path: 'admin/roles',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./page/modules/roles/roles.component')
            .then(m => m.RolesComponent)
      },
      {
        path: 'admin/clientes',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./page/modules/clientes/clientes.component')
            .then(m => m.ClientesComponent)
      },
      {
        path: 'admin/mascotas',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./page/modules/mascotas/mascotas.component')
            .then(m => m.MascotasComponent)
      },
      {
        path: 'admin/veterinarios',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./page/modules/veterinarios/veterinarios.component')
            .then(m => m.VeterinariosComponent)
      },
      {
        path: 'admin/citas',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./page/modules/citas/citas.component')
            .then(m => m.CitasComponent)
      },
      {
        path: 'admin/historial',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./page/modules/historial-medico/medical-case.component')
            .then(m => m.MedicalCaseComponent)
      },
      {
        path: 'veterinario',
        canActivate: [roleGuard(['VETERINARY'])],
        loadComponent: () =>
          import('./page/modules/dashboard/veterinary/veterinary.component')
            .then(m => m.VeterinaryComponent)
      },
      {
        path: 'veterinario/citas',
        canActivate: [roleGuard(['VETERINARY'])],
        loadComponent: () =>
          import('./page/modules/citas/citas.component')
            .then(m => m.CitasComponent)
      },
      {
        path: 'cliente',
        canActivate: [roleGuard(['CLIENT'])],
        loadComponent: () =>
          import('./page/modules/dashboard/client/client.component')
            .then(m => m.ClientComponent)
      },
      {
        path: 'cliente/citas',
        canActivate: [roleGuard(['CLIENT'])],
        loadComponent: () =>
          import('./page/modules/citas/citas.component')
            .then(m => m.CitasComponent)
      },
      {
        path: 'cliente/mascotas',
        canActivate: [roleGuard(['CLIENT'])],
        loadComponent: () =>
          import('./page/modules/mascotas/mascotas.component')
            .then(m => m.MascotasComponent)
      },
      {
        path: 'medical-case/:id/:type',
        canActivate: [roleGuard(['ADMIN', 'VETERINARY'])],
        loadComponent: () =>
          import('./page/modules/historial-medico/medical-events/medical-events.component')
            .then(m => m.MedicalEventsComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
