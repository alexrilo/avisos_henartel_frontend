import { inject, Injectable, signal } from '@angular/core';
import { USER_REPOSITORY_TOKEN } from '../domain/port/user.repository.port';
import { User, CreateUserRequest, UpdateUserRequest } from '../domain/model/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userRepository = inject(USER_REPOSITORY_TOKEN);
  
  private _users = signal<User[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async loadUsers(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const users = await this.userRepository.getUsers();
      this._users.set(users);
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cargar usuarios');
    } finally {
      this._loading.set(false);
    }
  }

  async createUser(user: CreateUserRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.userRepository.createUser(user);
      await this.loadUsers();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al crear usuario');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async updateUser(id: number, user: UpdateUserRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.userRepository.updateUser(id, user);
      await this.loadUsers();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al actualizar usuario');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async toggleUserActive(id: number): Promise<void> {
    try {
      await this.userRepository.toggleUserActive(id);
      await this.loadUsers();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cambiar estado');
      throw err;
    }
  }
}
