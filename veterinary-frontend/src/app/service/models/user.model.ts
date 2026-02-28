export interface User {
  id: number;
  username: string;
  roleId: number;
  enabled: boolean;
}

export interface ApiResponse<T> {
  status?: number;
  description?: string;
  data: T;
  total?: number;
  page?: number;
  size?: number;
}
