export interface Veterinary {
  id: number;
  user_id: number;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  specialty: string;
  available: boolean;
  created_at: string;
  updated_at: string | null;
  status: number;
}

export interface CreateVeterinaryDto {
  name: string;
  lastname: string;
  email: string;
  phone?: string;
  specialty: string;
}

export interface UpdateVeterinaryDto {
  name?: string;
  lastname?: string;
  phone?: string;
  specialty?: string;
}