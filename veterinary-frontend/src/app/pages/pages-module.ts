import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Admin } from './admin/admin';
import { Veterinario } from './veterinario/veterinario';
import { Cliente } from './cliente/cliente';

@NgModule({
  declarations: [
    Admin,
    Veterinario,
    Cliente
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    Admin,
    Veterinario,
    Cliente
  ]
})
export class PagesModule { }