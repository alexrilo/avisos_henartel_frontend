import { inject, Injectable, signal } from '@angular/core';
import { DashboardRepositoryPort, DASHBOARD_REPOSITORY_TOKEN } from '../domain/port/dashboard.repository.port';
import { DashboardData, DashboardFilters } from '../domain/model/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private repository = inject(DASHBOARD_REPOSITORY_TOKEN);

  private _data = signal<DashboardData | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _filters = signal<DashboardFilters>({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0]
  });

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filters = this._filters.asReadonly();

  async loadDashboard(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const result = await this.repository.getDashboardData(this._filters());
      this._data.set(result);
    } catch (err: any) {
      this._error.set(err?.error?.message || 'Error al cargar dashboard');
    } finally {
      this._loading.set(false);
    }
  }

  updateFilters(filters: Partial<DashboardFilters>): void {
    this._filters.set({ ...this._filters(), ...filters });
    this.loadDashboard();
  }
}