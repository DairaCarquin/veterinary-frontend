import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Admin } from './admin/admin';
import { Veterinario } from './veterinario/veterinario';
import { Cliente } from './cliente/cliente';

@NgModule({
  imports: [CommonModule, RouterModule, Admin, Veterinario, Cliente],
  exports: [Admin, Veterinario, Cliente],
})
export class PagesModule {}