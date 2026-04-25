import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardRepositoryPort, DASHBOARD_REPOSITORY_TOKEN } from '../domain/port/dashboard.repository.port';
import { DashboardData, DashboardFilters } from '../domain/model/dashboard.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardApiRepository implements DashboardRepositoryPort {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  async getDashboardData(filters: DashboardFilters): Promise<DashboardData> {
    let params = new HttpParams();
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters.tecnicoId) params = params.set('tecnicoId', filters.tecnicoId.toString());
    if (filters.prioridad) params = params.set('prioridad', filters.prioridad);

    return firstValueFrom(this.http.get<DashboardData>(this.API_URL, { params }));
  }
}