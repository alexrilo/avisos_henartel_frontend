import { InjectionToken } from '@angular/core';
import { DashboardData, DashboardFilters } from '../model/dashboard.model';

export interface DashboardRepositoryPort {
  getDashboardData(filters: DashboardFilters): Promise<DashboardData>;
}

export const DASHBOARD_REPOSITORY_TOKEN = new InjectionToken<DashboardRepositoryPort>('DashboardRepositoryPort');