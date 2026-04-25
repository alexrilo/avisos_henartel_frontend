import { LoginRequest, LoginResponse, AuthToken } from '../model/login.model';

export interface AuthRepositoryPort {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  getToken(): string | null;
  getStoredUser(): LoginResponse | null;
  isLoggedIn(): boolean;
  logout(): void;
}

import { InjectionToken } from '@angular/core';

export const AUTH_REPOSITORY_TOKEN = new InjectionToken<AuthRepositoryPort>('AuthRepositoryPort');
