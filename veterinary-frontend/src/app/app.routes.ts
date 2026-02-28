import { Routes } from '@angular/router';
import { MainLayoutComponent } from './componets/layout-component/main-layout/main-layout.component';
import { LoginComponent } from './page/auth/login/login.component';
import { authGuard } from './service/auth.guard';


export const routes: Routes = [

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [

      {
        path: 'admin',
        loadComponent: () =>
          import('./page/modules/dashboard/admin/admin.component')
            .then(m => m.AdminComponent)
      },
      {
        path: 'admin/usuarios',
        loadComponent: () =>
          import('./page/modules/usuarios/usuarios.component')
            .then(m => m.UsuariosComponent)
      },
      {
        path: 'admin/roles',
        loadComponent: () =>
          import('./page/modules/roles/roles.component')
            .then(m => m.RolesComponent)
      },
      {
        path: 'admin/clientes',
        loadComponent: () =>
          import('./page/modules/clientes/clientes.component')
            .then(m => m.ClientesComponent)
      },
      {
        path: 'admin/mascotas',
        loadComponent: () =>
          import('./page/modules/mascotas/mascotas.component')
            .then(m => m.MascotasComponent)
      },
      {
        path: 'admin/veterinarios',
        loadComponent: () =>
          import('./page/modules/veterinarios/veterinarios.component')
            .then(m => m.VeterinariosComponent)
      },
      {
        path: 'admin/citas',
        loadComponent: () =>
          import('./page/modules/citas/citas.component')
            .then(m => m.CitasComponent)
      },
      {
        path: 'admin/historial',
        loadComponent: () =>
          import('./page/modules/historial-medico/medical-case.component')
            .then(m => m.MedicalCaseComponent)
      },
      {
        path: 'medical-case/:id/:type',
        loadComponent: () =>
          import('./page/modules/historial-medico/medical-events/medical-events.component')
            .then(m => m.MedicalEventsComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
