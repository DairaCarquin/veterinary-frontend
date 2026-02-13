import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Veterinary } from '../models/veterinary.model';

@Injectable({
  providedIn: 'root',
})
export class VeterinaryService {
  getVeterinarios(): Observable<Veterinary[]> {
    return of([
      {
        id: 1,
        nombre: 'James Grey',
        especialidad: 'Cirugía',
        telefono: '987654321',
        estado: 'Activo',
        tipo: 'Noncore',
        fecha: '11 Dec 2024',
      },
      {
        id: 2,
        nombre: 'Jim Brown',
        especialidad: 'Dermatología',
        telefono: '912345678',
        estado: 'Activo',
        tipo: 'Core',
        fecha: '27 Jun 2024',
      },
      {
        id: 3,
        nombre: 'Helen Brooks',
        especialidad: 'Cardiología',
        telefono: '923456789',
        estado: 'Activo',
        tipo: 'Core',
        fecha: '16 Sep 2024',
      },
    ]);
  }
}