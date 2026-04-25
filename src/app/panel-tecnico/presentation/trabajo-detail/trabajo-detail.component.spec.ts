import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { TrabajoDetailComponent } from './trabajo-detail.component';
import { PanelTecnicoService } from '../../application/panel-tecnico.service';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TrabajoDetailData } from '../../domain/model/panel-tecnico.model';

describe('TrabajoDetailComponent', () => {
  let component: TrabajoDetailComponent;
  let fixture: ComponentFixture<TrabajoDetailComponent>;
  let mockService: jasmine.SpyObj<PanelTecnicoService>;

  const mockDetail: TrabajoDetailData = {
    id: 1,
    numeroCorrelativo: 'AVI-2024-0001',
    descripcion: 'Trabajo de prueba detallado',
    prioridad: 'ALTA',
    estado: 'EN_CURSO',
    direccion: 'Calle Falsa 123, Madrid',
    fechaCreacion: '2024-01-01T00:00:00',
    fechaProgramada: '2024-01-15T10:00:00',
    accionesDisponibles: [],
    clienteId: 5,
    observaciones: [
      {
        id: 1,
        contenido: 'Primera observación del trabajo',
        tipo: 'INFO',
        usuario: 'admin',
        fechaCreacion: '2024-01-02T10:00:00'
      },
      {
        id: 2,
        contenido: 'Segunda observación de seguimiento',
        tipo: 'SEGUIMIENTO',
        usuario: 'tech1',
        fechaCreacion: '2024-01-03T14:30:00'
      }
    ]
  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('PanelTecnicoService', ['getTrabajoDetail'], {
      stats: signal({ total: 0, urgentes: 0, enCurso: 0, pendientes: 0, completados: 0 }),
      cards: signal([]),
      loading: signal(false),
      error: signal(null),
      filter: signal({})
    });

    await TestBed.configureTestingModule({
      imports: [TrabajoDetailComponent],
      providers: [
        { provide: PanelTecnicoService, useValue: mockService },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrabajoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load detail on init', () => {
    expect(mockService.getTrabajoDetail).toHaveBeenCalledWith(1);
  });

  it('should display loading state when loading', () => {
    component.loading.set(true);
    fixture.detectChanges();

    const loadingEl = fixture.debugElement.query(By.css('.loading'));
    expect(loadingEl).toBeTruthy();
    expect(loadingEl.nativeElement.textContent).toContain('Cargando');
  });

  it('should display error when error exists', () => {
    component.error.set('Error de prueba');
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.error'));
    expect(errorEl).toBeTruthy();
    expect(errorEl.nativeElement.textContent).toContain('Error de prueba');
  });

  it('should display work detail when loaded', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const h1 = fixture.debugElement.query(By.css('h1'));
    expect(h1.nativeElement.textContent).toContain('AVI-2024-0001');
  });

  it('should display description', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const descSection = fixture.debugElement.queryAll(By.css('.detail-section h2'));
    expect(descSection[0].nativeElement.textContent).toContain('Descripción');
  });

  it('should display location', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const locationSection = fixture.debugElement.queryAll(By.css('.detail-section'));
    expect(locationSection[1].nativeElement.textContent).toContain('Ubicación');
  });

  it('should display info grid with clienteId', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const infoGrid = fixture.debugElement.query(By.css('.info-grid'));
    expect(infoGrid.nativeElement.textContent).toContain('Cliente ID:');
    expect(infoGrid.nativeElement.textContent).toContain('5');
  });

  it('should display prioridad label', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const infoGrid = fixture.debugElement.query(By.css('.info-grid'));
    expect(infoGrid.nativeElement.textContent).toContain('Prioridad:');
    expect(infoGrid.nativeElement.textContent).toContain('Alta');
  });

  it('should display fecha creacion', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const infoGrid = fixture.debugElement.query(By.css('.info-grid'));
    expect(infoGrid.nativeElement.textContent).toContain('Creado:');
  });

  it('should display fecha programada when present', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const infoGrid = fixture.debugElement.query(By.css('.info-grid'));
    expect(infoGrid.nativeElement.textContent).toContain('Programado:');
  });

  it('should display back link', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const backLink = fixture.debugElement.query(By.css('.back-link'));
    expect(backLink).toBeTruthy();
    expect(backLink.nativeElement.textContent).toContain('Volver al panel');
  });

  it('should display status badge', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const statusBadge = fixture.debugElement.query(By.css('.status-badge'));
    expect(statusBadge.nativeElement.textContent).toContain('En Curso');
  });

  it('should display observaciones section when present', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const observationsSection = fixture.debugElement.queryAll(By.css('.detail-section h2'));
    expect(observationsSection[2].nativeElement.textContent).toContain('Historial');
  });

  it('should display all observaciones', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const observationItems = fixture.debugElement.queryAll(By.css('.observation-item'));
    expect(observationItems.length).toBe(2);
  });

  it('should display observation contenido', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const obsContent = fixture.debugElement.queryAll(By.css('.obs-content'));
    expect(obsContent[0].nativeElement.textContent).toContain('Primera observación del trabajo');
  });

  it('should display observation tipo', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const obsType = fixture.debugElement.queryAll(By.css('.obs-type'));
    expect(obsType[0].nativeElement.textContent).toContain('INFO');
  });

  it('should display observation usuario', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const obsUser = fixture.debugElement.queryAll(By.css('.obs-user'));
    expect(obsUser[0].nativeElement.textContent).toContain('Por: admin');
  });

  it('should not display observaciones section when empty', () => {
    const detailNoObservaciones: TrabajoDetailData = {
      ...mockDetail,
      observaciones: []
    };
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(detailNoObservaciones));
    component.loading.set(false);
    fixture.detectChanges();

    const observationsSection = fixture.debugElement.queryAll(By.css('.detail-section h2'));
    const hasHistorial = observationsSection.some(el => el.nativeElement.textContent.includes('Historial'));
    expect(hasHistorial).toBeFalse();
  });

  it('should have detail-container class', () => {
    const container = fixture.debugElement.query(By.css('.detail-container'));
    expect(container).toBeTruthy();
  });

  it('should have detail-header section', () => {
    mockService.getTrabajoDetail.and.returnValue(Promise.resolve(mockDetail));
    component.loading.set(false);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.css('.detail-header'));
    expect(header).toBeTruthy();
  });

  it('should return correct prioridad labels', () => {
    expect(component.getPrioridadLabel('BAJA')).toBe('Baja');
    expect(component.getPrioridadLabel('MEDIA')).toBe('Media');
    expect(component.getPrioridadLabel('ALTA')).toBe('Alta');
    expect(component.getPrioridadLabel('URGENTE')).toBe('Urgente');
  });

  it('should return correct estado labels', () => {
    expect(component.getEstadoLabel('NUEVO')).toBe('Nuevo');
    expect(component.getEstadoLabel('ASIGNADO')).toBe('Asignado');
    expect(component.getEstadoLabel('EN_CURSO')).toBe('En Curso');
    expect(component.getEstadoLabel('COMPLETADO')).toBe('Completado');
    expect(component.getEstadoLabel('CANCELADO')).toBe('Cancelado');
    expect(component.getEstadoLabel('PENDIENTE_SEGUIMIENTO')).toBe('Pendiente Seguimiento');
  });

  it('should call getTrabajoDetail with correct id from route', () => {
    expect(mockService.getTrabajoDetail).toHaveBeenCalledWith(1);
  });
});