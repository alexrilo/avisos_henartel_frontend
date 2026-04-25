import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AvisoListComponent } from './aviso-list.component';
import { AvisoService } from '../../application/aviso.service';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Aviso } from '../../domain/model/aviso.model';

describe('AvisoListComponent', () => {
  let component: AvisoListComponent;
  let fixture: ComponentFixture<AvisoListComponent>;
  let mockService: jasmine.SpyObj<AvisoService>;

  const mockAvisos: Aviso[] = [
    {
      id: 1,
      numeroCorrelativo: 'AVI-2026-0001',
      clienteId: 1,
      descripcion: 'Test aviso 1',
      prioridad: 'ALTA',
      estado: 'NUEVO',
      direccion: {
        calle: 'Calle Falsa',
        numero: '123',
        localidad: 'Madrid',
        provincia: 'Madrid',
        codigoPostal: '28001'
      },
      fechaCreacion: '2026-01-01T00:00:00',
      fechaProgramada: null,
      tecnicoId: null,
      fechaInicio: null,
      fechaFin: null,
      observaciones: []
    },
    {
      id: 2,
      numeroCorrelativo: 'AVI-2026-0002',
      clienteId: 2,
      descripcion: 'Test aviso 2',
      prioridad: 'BAJA',
      estado: 'ASIGNADO',
      direccion: {
        calle: 'Otra Calle',
        numero: '456',
        localidad: 'Barcelona',
        provincia: 'Barcelona',
        codigoPostal: '08001'
      },
      fechaCreacion: '2026-01-02T00:00:00',
      fechaProgramada: '2026-01-10T10:00:00',
      tecnicoId: 1,
      fechaInicio: null,
      fechaFin: null,
      observaciones: []
    }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('AvisoService', [
      'loadAvisos',
      'cancelar',
      'updateSearch',
      'updateFilter',
      'updatePage'
    ], {
      avisos: signal([]),
      loading: signal(false),
      error: signal(null),
      pagination: signal({ totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 20 }),
      hasPreviousPage: signal(false),
      hasNextPage: signal(false)
    });

    await TestBed.configureTestingModule({
      imports: [AvisoListComponent],
      providers: [
        { provide: AvisoService, useValue: mockService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AvisoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load avisos on init', () => {
    expect(mockService.loadAvisos).toHaveBeenCalled();
  });

  it('should display empty message when no avisos', () => {
    const emptyMsg = fixture.debugElement.query(By.css('.empty-message'));
    expect(emptyMsg).toBeTruthy();
  });

  it('should display avisos when loaded', () => {
    // Arrange
    mockService.avisos.set(mockAvisos);
    mockService.loading.set(false);
    fixture.detectChanges();

    // Act
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));

    // Assert
    expect(rows.length).toBe(2);
  });

  it('should display loading spinner when loading', () => {
    // Arrange
    mockService.loading.set(true);
    fixture.detectChanges();

    // Act
    const spinner = fixture.debugElement.query(By.css('.loading-spinner'));

    // Assert
    expect(spinner).toBeTruthy();
  });

  it('should display error message when error exists', () => {
    // Arrange
    mockService.error.set('Error de prueba');
    fixture.detectChanges();

    // Act
    const errorMsg = fixture.debugElement.query(By.css('.error-message'));

    // Assert
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.nativeElement.textContent).toContain('Error de prueba');
  });

  it('should call loadAvisos when refresh button is clicked', () => {
    // Act
    const refreshButton = fixture.debugElement.query(By.css('.refresh-btn'));
    refreshButton.nativeElement.click();
    fixture.detectChanges();

    // Assert
    expect(mockService.loadAvisos).toHaveBeenCalled();
  });

  it('should call updateSearch when search input is used', () => {
    // Act
    const searchInput = fixture.debugElement.query(By.css('.search-input'));
    searchInput.nativeElement.value = 'Test search';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Assert
    expect(mockService.updateSearch).toHaveBeenCalledWith('Test search');
  });

  it('should have pagination controls', () => {
    mockService.pagination.set({ totalElements: 50, totalPages: 3, currentPage: 1, pageSize: 20 });
    mockService.hasPreviousPage.set(true);
    mockService.hasNextPage.set(true);
    fixture.detectChanges();

    const prevButton = fixture.debugElement.query(By.css('.prev-btn'));
    const nextButton = fixture.debugElement.query(By.css('.next-btn'));

    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();
  });

  it('should call updatePage when next page button is clicked', () => {
    mockService.pagination.set({ totalElements: 50, totalPages: 3, currentPage: 1, pageSize: 20 });
    mockService.hasNextPage.set(true);
    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('.next-btn'));
    nextButton.nativeElement.click();
    fixture.detectChanges();

    expect(mockService.updatePage).toHaveBeenCalledWith(2);
  });

  it('should call updatePage when previous page button is clicked', () => {
    mockService.pagination.set({ totalElements: 50, totalPages: 3, currentPage: 1, pageSize: 20 });
    mockService.hasPreviousPage.set(true);
    fixture.detectChanges();

    const prevButton = fixture.debugElement.query(By.css('.prev-btn'));
    prevButton.nativeElement.click();
    fixture.detectChanges();

    expect(mockService.updatePage).toHaveBeenCalledWith(0);
  });

  it('should call updateFilter when filter select is changed', () => {
    const filterSelect = fixture.debugElement.query(By.css('.filter-select'));
    filterSelect.nativeElement.value = 'NUEVO';
    filterSelect.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(mockService.updateFilter).toHaveBeenCalledWith('estado', 'NUEVO');
  });

  it('should display estado with correct styling', () => {
    mockService.avisos.set(mockAvisos);
    fixture.detectChanges();

    const estadoBadge = fixture.debugElement.query(By.css('.estado-badge'));
    expect(estadoBadge).toBeTruthy();
  });

  it('should display prioridad with correct styling', () => {
    mockService.avisos.set(mockAvisos);
    fixture.detectChanges();

    const prioridadBadge = fixture.debugElement.query(By.css('.prioridad-badge'));
    expect(prioridadBadge).toBeTruthy();
  });

  it('should disable prev button on first page', () => {
    mockService.pagination.set({ totalElements: 20, totalPages: 1, currentPage: 0, pageSize: 20 });
    mockService.hasPreviousPage.set(false);
    fixture.detectChanges();

    const prevButton = fixture.debugElement.query(By.css('.prev-btn'));
    expect(prevButton.nativeElement.disabled).toBeTrue();
  });

  it('should disable next button on last page', () => {
    mockService.pagination.set({ totalElements: 20, totalPages: 1, currentPage: 0, pageSize: 20 });
    mockService.hasNextPage.set(false);
    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('.next-btn'));
    expect(nextButton.nativeElement.disabled).toBeTrue();
  });
});