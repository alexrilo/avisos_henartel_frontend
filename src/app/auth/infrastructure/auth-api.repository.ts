import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthRepositoryPort, AUTH_REPOSITORY_TOKEN } from '../domain/port/auth.repository.port';
import { LoginRequest, LoginResponse } from '../domain/model/login.model';
import { environment } from '../../../../environments/environment';

export class AuthApiRepository implements AuthRepositoryPort {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .toPromise()
      .then(response => {
        if (response) {
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response));
        }
        return response as LoginResponse;
      });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getStoredUser(): LoginResponse | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
