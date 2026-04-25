export interface User {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
}

export interface UpdateUserRequest {
  nombre: string;
  apellido: string;
  email: string;
}
