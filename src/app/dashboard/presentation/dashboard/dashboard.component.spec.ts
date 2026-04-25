import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../application/dashboard.service';
import { signal } from '@angular/core';
import { DashboardData } from '../../domain/model/dashboard.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockService: jasmine.SpyObj<DashboardService>;

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

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('DashboardService', ['loadDashboard', 'updateFilters'], {
      data: signal(null),
      loading: signal(false),
      error: signal(null),
      filters: signal({ dateFrom: '2026-04-03', dateTo: '2026-04-03' })
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: DashboardService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard on init', () => {
    expect(mockService.loadDashboard).toHaveBeenCalled();
  });

  it('should call updateFilters when date changes', () => {
    component.onDateChange('dateFrom', '2026-04-01');
    expect(mockService.updateFilters).toHaveBeenCalledWith({ dateFrom: '2026-04-01' });

    component.onDateChange('dateTo', '2026-04-10');
    expect(mockService.updateFilters).toHaveBeenCalledWith({ dateTo: '2026-04-10' });
  });

  it('should react to loading state changes', () => {
    mockService.loading.and.returnValue(signal(true));
    fixture.detectChanges();
    
    // Component should handle loading state without errors
    expect(component).toBeTruthy();
  });

  it('should react to error state changes', () => {
    mockService.error.and.returnValue(signal('Error loading data'));
    fixture.detectChanges();
    
    // Component should handle error state without errors
    expect(component).toBeTruthy();
  });
});