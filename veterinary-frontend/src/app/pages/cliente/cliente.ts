import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client, ClientServiceResult, CreateClientDto } from '../../models/client.model';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente.html',
  styleUrls: ['./cliente.css'],
})
export class Cliente implements OnInit {
  clientes: Client[] = [];

  nuevoCliente: CreateClientDto = {
    name: '',
    email: '',
    dni: '',
    phone: '',
  };

  mensajeExito = '';
  mensajeError = '';

  // Paso del formulario de registro (1: datos dueño, 2: datos mascota)
  registroPaso: 1 | 2 = 1;

  // Datos de la mascota inicial (mock local, no toca al backend)
  nuevaMascota: {
    nombre: string;
    especie: 'Perro' | 'Gato';
    raza: string;
    fechaNacimiento: string;
  } = {
    nombre: '',
    especie: 'Perro',
    raza: '',
    fechaNacimiento: '',
  };

  // Estado visual de validación de DNI
  dniDuplicado = false;

  // Filtros y búsqueda
  terminoBusqueda = '';
  filtroActivo: 'TODOS' | 'DEUDA' | 'FRECUENTES' | 'MES' = 'TODOS';

  // Cliente seleccionado para ficha detallada
  clienteSeleccionado: Client | null = null;

  // Mock: mascotas por cliente (id de cliente -> lista de mascotas)
  mascotasPorCliente: Record<
    number,
    { nombre: string; especie: 'Perro' | 'Gato'; edad: string }[]
  > = {
    1: [
      { nombre: 'Luna', especie: 'Perro', edad: '3 años' },
      { nombre: 'Simba', especie: 'Gato', edad: '2 años' },
    ],
    2: [{ nombre: 'Milo', especie: 'Perro', edad: '1 año' }],
  };

  // Mock: banderas de clientes con deuda y frecuentes
  clientesConDeuda = new Set<number>([1]);
  clientesFrecuentes = new Set<number>([1, 2]);

  constructor(@Inject(ClientService) private readonly clientService: ClientService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  private cargarClientes(): void {
    this.clientService.getClients().subscribe((clientes: Client[]) => {
      this.clientes = clientes.filter((c: Client) => c.status === 1);
    });
  }

  registrarCliente(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.nuevoCliente.name || !this.nuevoCliente.email || !this.nuevoCliente.dni) {
      this.mensajeError = 'Nombre, email y DNI son obligatorios.';
      return;
    }

    if (this.dniDuplicado) {
      this.mensajeError = 'El DNI ya está registrado en el mock.';
      return;
    }

    if (!this.nuevaMascota.nombre) {
      this.mensajeError = 'Debes registrar al menos una mascota (nombre obligatorio).';
      return;
    }

    this.clientService
      .registerClient(this.nuevoCliente)
      .subscribe((result: ClientServiceResult<Client>) => {
        if (!result.success || !result.data) {
          this.mensajeError = result.message;
          return;
        }

        this.mensajeExito = result.message;

        // Añadimos la mascota inicial al mapa mock para que aparezca en las badges
        const nuevoCliente = result.data;
        const mascotasActuales = this.mascotasPorCliente[nuevoCliente.id] || [];
        this.mascotasPorCliente[nuevoCliente.id] = [
          ...mascotasActuales,
          {
            nombre: this.nuevaMascota.nombre,
            especie: this.nuevaMascota.especie,
            edad: 'Desconocida',
          },
        ];

        this.nuevoCliente = {
          name: '',
          email: '',
          dni: '',
          phone: '',
        };
        this.nuevaMascota = {
          nombre: '',
          especie: 'Perro',
          raza: '',
          fechaNacimiento: '',
        };
        this.registroPaso = 1;
        this.cargarClientes();
      });
  }

  irAPaso(paso: 1 | 2): void {
    this.registroPaso = paso;
  }

  onDniChange(): void {
    if (!this.nuevoCliente.dni) {
      this.dniDuplicado = false;
      return;
    }
    this.dniDuplicado = this.clientService.dniExists(this.nuevoCliente.dni);
  }

  get clientesFiltrados(): Client[] {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    const ahora = new Date();
    return this.clientes.filter((c) => {
      // filtro rápido
      if (this.filtroActivo === 'DEUDA' && !this.clientesConDeuda.has(c.id)) {
        return false;
      }
      if (this.filtroActivo === 'FRECUENTES' && !this.clientesFrecuentes.has(c.id)) {
        return false;
      }
      if (this.filtroActivo === 'MES') {
        const creado = new Date(c.created_at);
        if (
          creado.getFullYear() !== ahora.getFullYear() ||
          creado.getMonth() !== ahora.getMonth()
        ) {
          return false;
        }
      }

      // búsqueda por nombre, dni o nombre de mascota
      if (!termino) return true;

      const enNombre = c.name.toLowerCase().includes(termino);
      const enDni = c.dni.toLowerCase().includes(termino);
      const mascotas = this.mascotasPorCliente[c.id] || [];
      const enMascota = mascotas.some((m) => m.nombre.toLowerCase().includes(termino));

      return enNombre || enDni || enMascota;
    });
  }

  seleccionarCliente(c: Client): void {
    this.clienteSeleccionado = c;
  }

  cerrarFicha(): void {
    this.clienteSeleccionado = null;
  }

  mascotasDeCliente(c: Client) {
    return this.mascotasPorCliente[c.id] || [];
  }

  // Mock de historial de visitas del cliente seleccionado
  get historialVisitasSeleccionado(): { tipo: 'ULTIMA' | 'PROXIMA'; texto: string }[] {
    if (!this.clienteSeleccionado) return [];
    if (this.clienteSeleccionado.id === 1) {
      return [
        { tipo: 'ULTIMA', texto: '15 de Feb - Vacunación Triple Felina' },
        { tipo: 'PROXIMA', texto: '20 de Marzo - Desparasitación' },
      ];
    }
    if (this.clienteSeleccionado.id === 2) {
      return [{ tipo: 'ULTIMA', texto: '10 de Feb - Control general' }];
    }
    return [];
  }

  exportarCsv(): void {
    // Mock simple: en un backend real aquí se generaría y descargaría un archivo
    // Por ahora solo mostramos en consola los clientes filtrados
    // eslint-disable-next-line no-console
    console.log('Exportar CSV (mock)', this.clientesFiltrados);
  }
}
