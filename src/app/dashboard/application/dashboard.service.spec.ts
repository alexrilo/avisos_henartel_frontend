import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { DASHBOARD_REPOSITORY_TOKEN, DashboardRepositoryPort } from '../domain/port/dashboard.repository.port';
import { DashboardData } from '../domain/model/dashboard.model';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockRepository: jasmine.SpyObj<DashboardRepositoryPort>;

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('DashboardRepositoryPort', ['getDashboardData']);
    TestBed.configureTestingModule({
      providers: [
        { provide: DASHBOARD_REPOSITORY_TOKEN, useValue: mockRepository }
      ]
    });
    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load dashboard data', async () => {
    const mockData: DashboardData = {
      metrics: { 
        pendientes: 5, 
        asignados: 2, 
        enCurso: 3, 
        completadosHoy: 1, 
        urgentesPendientes: 2, 
        enSeguimiento: 1, 
        tecnicosActivos: 4, 
        creadosHoy: 10, 
        cerradosHoy: 1 
      },
      urgentList: [],
      todayJobs: [],
      technicianWorkload: [],
      scheduledJobs: [],
      chartByState: [],
      chartByTechnician: []
    };
    mockRepository.getDashboardData.and.returnValue(Promise.resolve(mockData));

    await service.loadDashboard();

    expect(service.data()?.metrics.pendientes).toBe(5);
    expect(service.loading()).toBe(false);
  });

  it('should handle error when loading fails', async () => {
    mockRepository.getDashboardData.and.returnValue(Promise.reject(new Error('API Error')));

    await service.loadDashboard();

    expect(service.error()).toBe('API Error');
    expect(service.loading()).toBe(false);
  });

  it('should update filters and reload dashboard', async () => {
    const mockData: DashboardData = {
      metrics: { 
        pendientes: 3, 
        asignados: 1, 
        enCurso: 2, 
        completadosHoy: 0, 
        urgentesPendientes: 1, 
        enSeguimiento: 0, 
        tecnicosActivos: 2, 
        creadosHoy: 5, 
        cerradosHoy: 0 
      },
      urgentList: [],
      todayJobs: [],
      technicianWorkload: [],
      scheduledJobs: [],
      chartByState: [],
      chartByTechnician: []
    };
    mockRepository.getDashboardData.and.returnValue(Promise.resolve(mockData));

    await service.updateFilters({ dateFrom: '2026-01-01', dateTo: '2026-01-31' });

    expect(service.filters().dateFrom).toBe('2026-01-01');
    expect(service.filters().dateTo).toBe('2026-01-31');
    expect(mockRepository.getDashboardData).toHaveBeenCalled();
  });

  it('should set loading state during load', async () => {
    let resolvePromise: (value: DashboardData) => void;
    const mockPromise = new Promise<DashboardData>((resolve) => {
      resolvePromise = resolve;
    });
    mockRepository.getDashboardData.and.returnValue(mockPromise);

    const loadPromise = service.loadDashboard();
    
    // Loading should be true while fetching
    expect(service.loading()).toBe(true);
    
    // Resolve the promise
    const mockData: DashboardData = {
      metrics: { pendientes: 0, asignados: 0, enCurso: 0, completadosHoy: 0, urgentesPendientes: 0, enSeguimiento: 0, tecnicosActivos: 0, creadosHoy: 0, cerradosHoy: 0 },
      urgentList: [],
      todayJobs: [],
      technicianWorkload: [],
      scheduledJobs: [],
      chartByState: [],
      chartByTechnician: []
    };
    resolvePromise!(mockData);
    
    await loadPromise;
    
    // Loading should be false after completion
    expect(service.loading()).toBe(false);
  });
});