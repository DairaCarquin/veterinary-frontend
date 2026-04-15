export interface Client {
  id: number;
  userId: number;
  username: string;
  email: string;
  phone: string;
  dni: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status?: number;
  description?: string;
  data: T;
  total?: number;
  page?: number;
  size?: number;
}
