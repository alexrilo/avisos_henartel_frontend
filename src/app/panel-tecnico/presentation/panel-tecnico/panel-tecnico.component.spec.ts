import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PanelTecnicoComponent } from './panel-tecnico.component';
import { PanelTecnicoService } from '../../application/panel-tecnico.service';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TrabajoCardData } from '../../domain/model/panel-tecnico.model';

describe('PanelTecnicoComponent', () => {
  let component: PanelTecnicoComponent;
  let fixture: ComponentFixture<PanelTecnicoComponent>;
  let mockService: jasmine.SpyObj<PanelTecnicoService>;

  const mockCards: TrabajoCardData[] = [
    {
      id: 1,
      numeroCorrelativo: 'AVI-2024-0001',
      descripcion: 'Trabajo de prueba 1',
      prioridad: 'URGENTE',
      estado: 'ASIGNADO',
      direccion: 'Calle Falsa 123, Madrid',
      fechaCreacion: '2024-01-01T00:00:00',
      fechaProgramada: null,
      accionesDisponibles: ['INICIAR', 'CANCELAR']
    },
    {
      id: 2,
      numeroCorrelativo: 'AVI-2024-0002',
      descripcion: 'Trabajo de prueba 2',
      prioridad: 'ALTA',
      estado: 'EN_CURSO',
      direccion: 'Otra Calle 456, Barcelona',
      fechaCreacion: '2024-01-02T00:00:00',
      fechaProgramada: '2024-01-10T10:00:00',
      accionesDisponibles: ['COMPLETAR', 'PENDIENTE', 'CANCELAR']
    }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('PanelTecnicoService', [
      'loadTrabajos',
      'updateFilter',
      'cambiarEstado'
    ], {
      stats: signal({ total: 0, urgentes: 0, enCurso: 0, pendientes: 0, completados: 0 }),
      cards: signal([]),
      loading: signal(false),
      error: signal(null),
      filter: signal({})
    });

    await TestBed.configureTestingModule({
      imports: [PanelTecnicoComponent],
      providers: [
        { provide: PanelTecnicoService, useValue: mockService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PanelTecnicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load trabajos on init', () => {
    expect(mockService.loadTrabajos).toHaveBeenCalled();
  });

  it('should display loading state when loading', () => {
    mockService.loading.set(true);
    fixture.detectChanges();

    const loadingEl = fixture.debugElement.query(By.css('.loading'));
    expect(loadingEl).toBeTruthy();
    expect(loadingEl.nativeElement.textContent).toContain('Cargando');
  });

  it('should display error when error exists', () => {
    mockService.error.set('Error de prueba');
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.error'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Error de prueba');
  });

  it('should display empty state when no cards', () => {
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyState).toBeTruthy();
    expect(emptyState.nativeElement.textContent).toContain('No tienes trabajos asignados');
  });

  it('should display cards when cards exist', () => {
    mockService.cards.set(mockCards);
    mockService.loading.set(false);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('app-trabajo-card'));
    expect(cards.length).toBe(2);
  });

  it('should display stats bar with correct values', () => {
    mockService.stats.set({
      total: 5,
      urgentes: 2,
      enCurso: 1,
      pendientes: 1,
      completados: 1
    });
    fixture.detectChanges();

    const statValues = fixture.debugElement.queryAll(By.css('.stat-value'));
    expect(statValues[0].nativeElement.textContent).toBe('5');
    expect(statValues[1].nativeElement.textContent).toBe('2');
    expect(statValues[2].nativeElement.textContent).toBe('1');
    expect(statValues[3].nativeElement.textContent).toBe('1');
  });

  it('should display stat labels', () => {
    const statLabels = fixture.debugElement.queryAll(By.css('.stat-label'));
    expect(statLabels[0].nativeElement.textContent).toBe('Total');
    expect(statLabels[1].nativeElement.textContent).toBe('Urgentes');
    expect(statLabels[2].nativeElement.textContent).toBe('En Curso');
    expect(statLabels[3].nativeElement.textContent).toBe('Pendientes');
  });

  it('should have search input', () => {
    const searchInput = fixture.debugElement.query(By.css('.search-input'));
    expect(searchInput).toBeTruthy();
  });

  it('should have filter select', () => {
    const filterSelect = fixture.debugElement.query(By.css('.filter-select'));
    expect(filterSelect).toBeTruthy();
  });

  it('should have all filter options', () => {
    const filterSelect = fixture.debugElement.query(By.css('.filter-select'));
    const options = filterSelect.nativeElement.querySelectorAll('option');
    
    expect(options.length).toBe(6); // "" + 5 states
    expect(options[0].value).toBe('');
    expect(options[1].value).toBe('NUEVO');
    expect(options[2].value).toBe('ASIGNADO');
    expect(options[3].value).toBe('EN_CURSO');
    expect(options[4].value).toBe('PENDIENTE_SEGUIMIENTO');
    expect(options[5].value).toBe('COMPLETADO');
  });

  it('should call updateFilter with search when search is triggered', () => {
    const searchInput = fixture.debugElement.query(By.css('.search-input'));
    searchInput.nativeElement.value = 'test search';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    
    component.onSearch();
    fixture.detectChanges();

    expect(mockService.updateFilter).toHaveBeenCalledWith({ search: 'test search' });
  });

  it('should call updateFilter when filter is changed', () => {
    const filterSelect = fixture.debugElement.query(By.css('.filter-select'));
    filterSelect.nativeElement.value = 'EN_CURSO';
    filterSelect.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(mockService.updateFilter).toHaveBeenCalledWith({ estado: 'EN_CURSO' });
  });

  it('should call cambiarEstado when onEstadoChange is called', async () => {
    const card = mockCards[0];
    mockService.cambiarEstado.and.returnValue(Promise.resolve());

    await component.onEstadoChange(card, 'INICIAR');

    expect(mockService.cambiarEstado).toHaveBeenCalledWith(1, 'EN_CURSO');
  });

  it('should map INICIAR to EN_CURSO', async () => {
    const card = mockCards[0];
    mockService.cambiarEstado.and.returnValue(Promise.resolve());

    await component.onEstadoChange(card, 'INICIAR');

    expect(mockService.cambiarEstado).toHaveBeenCalledWith(1, 'EN_CURSO');
  });

  it('should map COMPLETAR to COMPLETADO', async () => {
    const card = mockCards[0];
    mockService.cambiarEstado.and.returnValue(Promise.resolve());

    await component.onEstadoChange(card, 'COMPLETAR');

    expect(mockService.cambiarEstado).toHaveBeenCalledWith(1, 'COMPLETADO');
  });

  it('should map PENDIENTE to PENDIENTE_SEGUIMIENTO', async () => {
    const card = mockCards[0];
    mockService.cambiarEstado.and.returnValue(Promise.resolve());

    await component.onEstadoChange(card, 'PENDIENTE');

    expect(mockService.cambiarEstado).toHaveBeenCalledWith(1, 'PENDIENTE_SEGUIMIENTO');
  });

  it('should map REINICIAR to ASIGNADO', async () => {
    const card = mockCards[0];
    mockService.cambiarEstado.and.returnValue(Promise.resolve());

    await component.onEstadoChange(card, 'REINICIAR');

    expect(mockService.cambiarEstado).toHaveBeenCalledWith(1, 'ASIGNADO');
  });

  it('should map CANCELAR to CANCELADO', async () => {
    const card = mockCards[0];
    mockService.cambiarEstado.and.returnValue(Promise.resolve());

    await component.onEstadoChange(card, 'CANCELAR');

    expect(mockService.cambiarEstado).toHaveBeenCalledWith(1, 'CANCELADO');
  });

  it('should not call cambiarEstado for unknown action', async () => {
    const card = mockCards[0];

    await component.onEstadoChange(card, 'UNKNOWN_ACTION');

    expect(mockService.cambiarEstado).not.toHaveBeenCalled();
  });

  it('should have stats-bar container', () => {
    const statsBar = fixture.debugElement.query(By.css('.stats-bar'));
    expect(statsBar).toBeTruthy();
  });

  it('should have filters container', () => {
    const filters = fixture.debugElement.query(By.css('.filters'));
    expect(filters).toBeTruthy();
  });

  it('should have cards-list container when cards exist', () => {
    mockService.cards.set(mockCards);
    fixture.detectChanges();

    const cardsList = fixture.debugElement.query(By.css('.cards-list'));
    expect(cardsList).toBeTruthy();
  });
});