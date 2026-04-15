export interface User {
  id: number;
  username: string;
  roleId: number;
  enabled: boolean;
}

export interface RegisterUserPayload {
  email: string;
  password: string;
  role: 'ADMIN' | 'CLIENT' | 'VETERINARY' | '';
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
}

export interface ApiResponse<T> {
  status?: number;
  description?: string;
  data: T;
  total?: number;
  page?: number;
  size?: number;
}
