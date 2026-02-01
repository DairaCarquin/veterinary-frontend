export interface User {
  username: string;
  password: string;
  role: 'ADMIN' | 'VETERINARIO' | 'CLIENTE';
}
