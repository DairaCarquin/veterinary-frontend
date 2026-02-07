import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Veterinary } from '../models/veterinary.model';

@Injectable({
  providedIn: 'root'
})
export class VeterinaryService {

  getVeterinarios(): Observable<Veterinary[]> {
    return of([
      {
        id: 1,
        nombre: 'Dr. Juan Pérez',
        especialidad: 'Cirugía',
        telefono: '987654321',
        estado: 'Activo'
      },
      {
        id: 2,
        nombre: 'Dra. María López',
        especialidad: 'Dermatología',
        telefono: '912345678',
        estado: 'Activo'
      }
    ]);
  }
}
