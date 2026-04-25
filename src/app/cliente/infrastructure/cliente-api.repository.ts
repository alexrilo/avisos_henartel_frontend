import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ClienteRepositoryPort, CLIENTE_REPOSITORY_TOKEN } from '../domain/port/cliente.repository.port';
import { Cliente, CreateClienteRequest, UpdateClienteRequest, ClienteFilters, PaginatedResponse } from '../domain/model/cliente.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteApiRepository implements ClienteRepositoryPort {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/clientes`;

  async getClientes(filters: ClienteFilters): Promise<PaginatedResponse<Cliente>> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.tipo) params = params.set('tipo', filters.tipo);
    params = params.set('page', filters.page.toString());
    params = params.set('size', filters.size.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortDir) params = params.set('sortDir', filters.sortDir);

    const response = await firstValueFrom(
      this.http.get<PaginatedResponse<Cliente>>(this.API_URL, { params })
    );
    return response;
  }

  async getCliente(id: number): Promise<Cliente> {
    return firstValueFrom(this.http.get<Cliente>(`${this.API_URL}/${id}`));
  }

  async createCliente(cliente: CreateClienteRequest): Promise<Cliente> {
    return firstValueFrom(this.http.post<Cliente>(this.API_URL, cliente));
  }

  async updateCliente(id: number, cliente: UpdateClienteRequest): Promise<Cliente> {
    return firstValueFrom(this.http.put<Cliente>(`${this.API_URL}/${id}`, cliente));
  }

  async toggleClienteStatus(id: number): Promise<Cliente> {
    return firstValueFrom(this.http.patch<Cliente>(`${this.API_URL}/${id}/toggle-status`, {}));
  }
}