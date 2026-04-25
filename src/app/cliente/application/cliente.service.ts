import { inject, Injectable, signal, computed } from '@angular/core';
import { CLIENTE_REPOSITORY_TOKEN } from '../domain/port/cliente.repository.port';
import { Cliente, CreateClienteRequest, UpdateClienteRequest, ClienteFilters, PaginatedResponse } from '../domain/model/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private repository = inject(CLIENTE_REPOSITORY_TOKEN);

  private _clientes = signal<Cliente[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _pagination = signal({ totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 20 });
  private _filters = signal<ClienteFilters>({ page: 0, size: 20, sortBy: 'nombreOrazonSocial', sortDir: 'ASC' });

  readonly clientes = this._clientes.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly hasPreviousPage = computed(() => this._pagination().currentPage > 0);
  readonly hasNextPage = computed(() => this._pagination().currentPage < this._pagination().totalPages - 1);

  async loadClientes(filters?: Partial<ClienteFilters>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const currentFilters = { ...this._filters(), ...filters };
      this._filters.set(currentFilters);
      const response: PaginatedResponse<Cliente> = await this.repository.getClientes(currentFilters);
      this._clientes.set(response.content);
      this._pagination.set({
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        pageSize: response.pageSize
      });
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cargar clientes');
    } finally {
      this._loading.set(false);
    }
  }

  async createCliente(cliente: CreateClienteRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.repository.createCliente(cliente);
      await this.loadClientes();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al crear cliente');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async updateCliente(id: number, cliente: UpdateClienteRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.repository.updateCliente(id, cliente);
      await this.loadClientes();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al actualizar cliente');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async toggleClienteStatus(id: number): Promise<void> {
    this._error.set(null);
    try {
      await this.repository.toggleClienteStatus(id);
      await this.loadClientes();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cambiar estado');
      throw err;
    }
  }

  updateSearch(search: string): void {
    this.loadClientes({ search, page: 0 });
  }

  updatePage(page: number): void {
    this.loadClientes({ page });
  }

  async getCliente(id: number): Promise<Cliente> {
    return this.repository.getCliente(id);
  }
}
