import { InjectionToken } from '@angular/core';
import { Cliente, CreateClienteRequest, UpdateClienteRequest, ClienteFilters, PaginatedResponse } from '../model/cliente.model';

export interface ClienteRepositoryPort {
  getClientes(filters: ClienteFilters): Promise<PaginatedResponse<Cliente>>;
  getCliente(id: number): Promise<Cliente>;
  createCliente(cliente: CreateClienteRequest): Promise<Cliente>;
  updateCliente(id: number, cliente: UpdateClienteRequest): Promise<Cliente>;
  toggleClienteStatus(id: number): Promise<Cliente>;
}

export const CLIENTE_REPOSITORY_TOKEN = new InjectionToken<ClienteRepositoryPort>('ClienteRepositoryPort');