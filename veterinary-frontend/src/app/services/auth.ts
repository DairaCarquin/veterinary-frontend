import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  users = [
    { username: 'admin', password: '123', role: 'ADMIN' },
    { username: 'veter', password: '123', role: 'VETERINARIO' },
    { username: 'cliente', password: '123', role: 'CLIENTE' },
  ];

  login(username: any, password: any) {
    return (
      this.users.find(u => u.username === username && u.password === password) || null
    );
  }
}
