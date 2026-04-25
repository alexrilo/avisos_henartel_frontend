import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserRepositoryPort } from '../domain/port/user.repository.port';
import { User, CreateUserRequest, UpdateUserRequest } from '../domain/model/user.model';
import { environment } from '../../../../environments/environment';

export class UserApiRepository implements UserRepositoryPort {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/usuarios`;

  getUsers(): Promise<User[]> {
    return this.http.get<User[]>(this.API_URL).toPromise() as Promise<User[]>;
  }

  getUser(id: number): Promise<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`).toPromise() as Promise<User>;
  }

  createUser(user: CreateUserRequest): Promise<User> {
    return this.http.post<User>(this.API_URL, user).toPromise() as Promise<User>;
  }

  updateUser(id: number, user: UpdateUserRequest): Promise<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user).toPromise() as Promise<User>;
  }

  toggleUserActive(id: number): Promise<User> {
    return this.http.put<User>(`${this.API_URL}/${id}/toggle-activo`, {}).toPromise() as Promise<User>;
  }
}
