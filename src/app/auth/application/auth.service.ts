import { inject, Injectable, signal, effect } from '@angular/core';
import { AUTH_REPOSITORY_TOKEN } from '../domain/port/auth.repository.port';
import { LoginRequest, LoginResponse } from '../domain/model/login.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authRepository = inject(AUTH_REPOSITORY_TOKEN);
  private router = inject(Router);
  
  // Restore user from localStorage on service init
  private _user = signal<LoginResponse | null>(this.authRepository.getStoredUser());
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async login(credentials: LoginRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const response = await this.authRepository.login(credentials);
      this._user.set(response);
      
      // Role-based redirect after login
      const role = response.role;
      if (role === 'TECNICO') {
        this.router.navigate(['/dashboard/panel-tecnico']);
      } else {
        this.router.navigate(['/dashboard/home']);
      }
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  logout(): void {
    this.authRepository.logout();
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authRepository.isLoggedIn();
  }
}
