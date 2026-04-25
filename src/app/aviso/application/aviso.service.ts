import { inject, Injectable, signal, computed } from '@angular/core';
import { AVISO_REPOSITORY_TOKEN } from '../domain/port/aviso.repository.port';
import { 
  Aviso, 
  CreateAvisoRequest, 
  UpdateAvisoRequest, 
  AssignTecnicoRequest, 
  ChangeEstadoRequest, 
  ReprogramarRequest, 
  AvisoFilters, 
  PaginatedResponse 
} from '../domain/model/aviso.model';

@Injectable({ providedIn: 'root' })
export class AvisoService {
  private repository = inject(AVISO_REPOSITORY_TOKEN);

  private _avisos = signal<Aviso[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _pagination = signal({ totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 20 });
  private _filters = signal<AvisoFilters>({ page: 0, size: 20, sortBy: 'fechaCreacion', sortDir: 'DESC' });

  readonly avisos = this._avisos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly hasPreviousPage = computed(() => this._pagination().currentPage > 0);
  readonly hasNextPage = computed(() => this._pagination().currentPage < this._pagination().totalPages - 1);

  async loadAvisos(filters?: Partial<AvisoFilters>): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const currentFilters = { ...this._filters(), ...filters };
      this._filters.set(currentFilters);
      const response: PaginatedResponse<Aviso> = await this.repository.getAvisos(currentFilters);
      this._avisos.set(response.content);
      this._pagination.set({
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        pageSize: response.pageSize
      });
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cargar avisos');
    } finally {
      this._loading.set(false);
    }
  }

  async createAviso(aviso: CreateAvisoRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.repository.createAviso(aviso);
      await this.loadAvisos();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al crear aviso');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async updateAviso(id: number, aviso: UpdateAvisoRequest): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.repository.updateAviso(id, aviso);
      await this.loadAvisos();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al actualizar aviso');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async assignTecnico(id: number, request: AssignTecnicoRequest): Promise<void> {
    this._error.set(null);
    try {
      await this.repository.assignTecnico(id, request);
      await this.loadAvisos();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al asignar técnico');
      throw err;
    }
  }

  async changeEstado(id: number, request: ChangeEstadoRequest): Promise<void> {
    this._error.set(null);
    try {
      await this.repository.changeEstado(id, request);
      await this.loadAvisos();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cambiar estado');
      throw err;
    }
  }

  async reprogramar(id: number, request: ReprogramarRequest): Promise<void> {
    this._error.set(null);
    try {
      await this.repository.reprogramar(id, request);
      await this.loadAvisos();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al reprogramar');
      throw err;
    }
  }

  async cancelar(id: number): Promise<void> {
    this._error.set(null);
    try {
      await this.repository.cancelar(id);
      await this.loadAvisos();
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cancelar aviso');
      throw err;
    }
  }

  async getAviso(id: number): Promise<Aviso> {
    return this.repository.getAviso(id);
  }

  async getMisTrabajos(tecnicoId: number): Promise<Aviso[]> {
    this._loading.set(true);
    this._error.set(null);
    try {
      return await this.repository.getMisTrabajos(tecnicoId);
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cargar mis trabajos');
      return [];
    } finally {
      this._loading.set(false);
    }
  }

  updateSearch(search: string): void {
    this.loadAvisos({ search, page: 0 });
  }

  updatePage(page: number): void {
    this.loadAvisos({ page });
  }

  updateFilter(field: keyof AvisoFilters, value: any): void {
    this.loadAvisos({ [field]: value, page: 0 });
  }
}
