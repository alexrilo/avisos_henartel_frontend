import { User, CreateUserRequest, UpdateUserRequest } from '../model/user.model';

export interface UserRepositoryPort {
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User>;
  createUser(user: CreateUserRequest): Promise<User>;
  updateUser(id: number, user: UpdateUserRequest): Promise<User>;
  toggleUserActive(id: number): Promise<User>;
}

import { InjectionToken } from '@angular/core';

export const USER_REPOSITORY_TOKEN = new InjectionToken<UserRepositoryPort>('UserRepositoryPort');
