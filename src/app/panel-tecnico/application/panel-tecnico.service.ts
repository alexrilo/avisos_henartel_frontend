import { inject, Injectable, signal, computed } from '@angular/core';
import { PANEL_TECNICO_REPOSITORY_TOKEN, PanelTecnicoRepositoryPort } from '../domain/port/panel-tecnico.repository.port';
import { AuthService } from '../../auth/application/auth.service';
import { 
  PanelStats, 
  TrabajoCardData, 
  TrabajoDetailData, 
  TrabajoFilter 
} from '../domain/model/panel-tecnico.model';
import { Aviso } from '../../aviso/domain/model/aviso.model';

@Injectable({ providedIn: 'root' })
export class PanelTecnicoService {
  private repository = inject(PANEL_TECNICO_REPOSITORY_TOKEN);
  private authService = inject(AuthService);

  private _trabajos = signal<Aviso[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _filter = signal<TrabajoFilter>({});

  readonly trabajos = this._trabajos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filter = this._filter.asReadonly();

  /**
   * Computed stats from the current list of jobs.
   */
  readonly stats = computed<PanelStats>(() => {
    const trabajos = this._trabajos();
    return {
      total: trabajos.length,
      urgentes: trabajos.filter(t => t.prioridad === 'URGENTE' && t.estado !== 'COMPLETADO' && t.estado !== 'CANCELADO').length,
      enCurso: trabajos.filter(t => t.estado === 'EN_CURSO').length,
      pendientes: trabajos.filter(t => t.estado === 'ASIGNADO' || t.estado === 'NUEVO').length,
      completados: trabajos.filter(t => t.estado === 'COMPLETADO').length
    };
  });

  /**
   * Computed filtered and mapped card data.
   */
  readonly cards = computed<TrabajoCardData[]>(() => {
    const trabajos = this._trabajos();
    const filter = this._filter();
    
    let filtered = trabajos;
    if (filter.estado) {
      filtered = filtered.filter(t => t.estado === filter.estado);
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.descripcion.toLowerCase().includes(search) || 
        t.numeroCorrelativo.toLowerCase().includes(search)
      );
    }

    return filtered.map(t => this.mapToCardData(t));
  });

  /**
   * Load jobs for the current technician.
   */
  async loadTrabajos(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const user = this.authService.user();
      if (!user?.userId) {
        this._error.set('No se pudo identificar al técnico');
        return;
      }
      const data = await this.repository.getMisTrabajos(user.userId);
      this._trabajos.set(data);
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cargar mis trabajos');
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Change status of a job.
   */
  async cambiarEstado(avisoId: number, estado: string, tecnicoId?: number, observacion?: string): Promise<void> {
    this._error.set(null);
    try {
      await this.repository.changeEstado(avisoId, { estado, tecnicoId, observacion });
      await this.loadTrabajos(); // Refresh list
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cambiar estado');
      throw err;
    }
  }

  /**
   * Get full detail for a job.
   */
  async getTrabajoDetail(avisoId: number): Promise<TrabajoDetailData | null> {
    try {
      const user = this.authService.user();
      const tecnicoId = user?.userId;
      const aviso = await this.repository.getAviso(avisoId, tecnicoId);
      return this.mapToDetailData(aviso);
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cargar detalle');
      return null;
    }
  }

  /**
   * Update filter and refresh.
   */
  updateFilter(filter: Partial<TrabajoFilter>): void {
    this._filter.set({ ...this._filter(), ...filter });
  }

  /**
   * Map Aviso domain model to TrabajoCardData view model.
   */
  private mapToCardData(aviso: Aviso): TrabajoCardData {
    return {
      id: aviso.id,
      numeroCorrelativo: aviso.numeroCorrelativo,
      descripcion: aviso.descripcion,
      prioridad: aviso.prioridad,
      estado: aviso.estado,
      direccion: `${aviso.direccion.calle} ${aviso.direccion.numero}, ${aviso.direccion.localidad}`,
      fechaCreacion: aviso.fechaCreacion,
      fechaProgramada: aviso.fechaProgramada,
      accionesDisponibles: this.getAccionesDisponibles(aviso.estado)
    };
  }

  /**
   * Map Aviso domain model to TrabajoDetailData view model.
   */
  private mapToDetailData(aviso: Aviso): TrabajoDetailData {
    return {
      ...this.mapToCardData(aviso),
      clienteId: aviso.clienteId,
      observaciones: aviso.observaciones.map(o => ({
        id: o.id || 0,
        contenido: o.contenido,
        tipo: o.tipo,
        usuario: o.usuario,
        fechaCreacion: o.fechaCreacion
      }))
    };
  }

  /**
   * Determine available quick actions based on current state.
   */
  private getAccionesDisponibles(estado: string): string[] {
    switch (estado) {
      case 'NUEVO':
      case 'ASIGNADO':
        return ['INICIAR', 'CANCELAR'];
      case 'EN_CURSO':
        return ['COMPLETAR', 'PENDIENTE', 'CANCELAR'];
      case 'PENDIENTE_SEGUIMIENTO':
        return ['REINICIAR', 'CANCELAR'];
      default:
        return [];
    }
  }
}