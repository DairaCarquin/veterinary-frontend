export interface Client {
  id: number;
  user_id: number;
  name: string;
  email: string;
  dni: string;
  phone?: string;
  pet_ids?: number[];
  created_at: string;
  updated_at: string | null;
  status: number;
}

export interface CreateClientDto {
  name: string;
  email: string;
  dni: string;
  phone?: string;
}

export interface UpdateClientDto {
  name?: string;
  phone?: string;
}

export interface ClientServiceResult<T> {
  success: boolean;
  message: string;
  data?: T;
}
