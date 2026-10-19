import { Injectable } from '@angular/core';
import { AuthUser } from './models';

const TOKEN = 'oja.jwt';
const USER = 'oja.user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  token(): string | null {
    return localStorage.getItem(TOKEN);
  }

  user(): AuthUser | null {
    const raw = localStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  save(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN, token);
    localStorage.setItem(USER, JSON.stringify(user));
  }

  clear() {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER);
  }
}
