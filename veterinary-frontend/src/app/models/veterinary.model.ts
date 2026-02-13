export interface Veterinary {
  id: number;
  nombre: string;
  especialidad: string;
  telefono: string;
  estado: string;
  tipo?: string; // Core, Noncore, Overdue, etc.
  fecha?: string;
}