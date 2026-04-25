import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TrabajoCardComponent } from './trabajo-card.component';
import { TrabajoCardData } from '../../domain/model/panel-tecnico.model';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TrabajoCardComponent', () => {
  let component: TrabajoCardComponent;
  let fixture: ComponentFixture<TrabajoCardComponent>;

  const mockCard: TrabajoCardData = {
    id: 1,
    numeroCorrelativo: 'AVI-2024-0001',
    descripcion: 'Trabajo de prueba',
    prioridad: 'ALTA',
    estado: 'ASIGNADO',
    direccion: 'Calle Falsa 123, Madrid',
    fechaCreacion: '2024-01-01T00:00:00',
    fechaProgramada: null,
    accionesDisponibles: ['INICIAR', 'CANCELAR']
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrabajoCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TrabajoCardComponent);
    component = fixture.componentInstance;
    component.card.set(mockCard);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render card number', () => {
    const cardNumber = fixture.debugElement.query(By.css('.card-number'));
    expect(cardNumber.nativeElement.textContent).toContain('AVI-2024-0001');
  });

  it('should render description', () => {
    const description = fixture.debugElement.query(By.css('.card-description'));
    expect(description.nativeElement.textContent).toContain('Trabajo de prueba');
  });

  it('should render address', () => {
    const address = fixture.debugElement.query(By.css('.card-address'));
    expect(address.nativeElement.textContent).toContain('Calle Falsa 123, Madrid');
  });

  it('should render estado label', () => {
    const status = fixture.debugElement.query(By.css('.card-status'));
    expect(status.nativeElement.textContent).toContain('Asignado');
  });

  it('should NOT render scheduled date when null', () => {
    const dateEl = fixture.debugElement.query(By.css('.card-date'));
    expect(dateEl).toBeFalsy();
  });

  it('should render scheduled date when present', () => {
    const cardWithDate: TrabajoCardData = {
      ...mockCard,
      fechaProgramada: '2024-01-15T10:00:00'
    };
    component.card.set(cardWithDate);
    fixture.detectChanges();

    const dateEl = fixture.debugElement.query(By.css('.card-date'));
    expect(dateEl).toBeTruthy();
  });

  it('should emit accion when quick action button is clicked', () => {
    let emitted: { card: TrabajoCardData; accion: string } | undefined;
    component.accion.subscribe(val => emitted = val);

    const buttons = fixture.debugElement.queryAll(By.css('.card-actions button'));
    buttons[0].nativeElement.click();

    expect(emitted).toBeTruthy();
    expect(emitted?.accion).toBe('INICIAR');
    expect(emitted?.card).toEqual(mockCard);
  });

  it('should emit CANCELAR action correctly', () => {
    let emitted: { card: TrabajoCardData; accion: string } | undefined;
    component.accion.subscribe(val => emitted = val);

    const buttons = fixture.debugElement.queryAll(By.css('.card-actions button'));
    buttons[1].nativeElement.click();

    expect(emitted?.accion).toBe('CANCELAR');
  });

  it('should have detail button linking to detail page', () => {
    const detailLink = fixture.debugElement.query(By.css('.btn-secondary'));
    expect(detailLink).toBeTruthy();
    expect(detailLink.nativeElement.textContent).toContain('Ver Detalle');
  });

  it('should have correct router link', () => {
    const detailLink = fixture.debugElement.query(By.css('.btn-secondary'));
    expect(detailLink.attributes['ng-reflect-router-link']).toContain('/1');
  });

  it('should have all quick action buttons', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.card-actions button'));
    expect(buttons.length).toBe(3); // 1 Ver Detalle + 2 actions
  });

  it('should render all available actions', () => {
    const actionButtons = fixture.debugElement.queryAll(By.css('.card-actions button'));
    expect(actionButtons[1].nativeElement.textContent).toContain('INICIAR');
    expect(actionButtons[2].nativeElement.textContent).toContain('CANCELAR');
  });

  it('should apply correct prioridad class for ALTA', () => {
    const card = fixture.debugElement.query(By.css('.card'));
    expect(card.nativeElement.classList.contains('border-alta')).toBeTrue();
  });

  it('should apply correct prioridad class for URGENTE', () => {
    const urgentCard: TrabajoCardData = { ...mockCard, prioridad: 'URGENTE' };
    component.card.set(urgentCard);
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css('.card'));
    expect(card.nativeElement.classList.contains('border-urgente')).toBeTrue();
  });

  it('should apply correct prioridad class for MEDIA', () => {
    const mediaCard: TrabajoCardData = { ...mockCard, prioridad: 'MEDIA' };
    component.card.set(mediaCard);
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css('.card'));
    expect(card.nativeElement.classList.contains('border-media')).toBeTrue();
  });

  it('should apply correct prioridad class for BAJA', () => {
    const bajaCard: TrabajoCardData = { ...mockCard, prioridad: 'BAJA' };
    component.card.set(bajaCard);
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css('.card'));
    expect(card.nativeElement.classList.contains('border-baja')).toBeTrue();
  });

  it('should return empty class for unknown prioridad', () => {
    const unknownCard: TrabajoCardData = { ...mockCard, prioridad: 'UNKNOWN' as any };
    component.card.set(unknownCard);
    fixture.detectChanges();

    const result = component.getPrioridadClass('UNKNOWN');
    expect(result).toBe('');
  });

  it('should return correct estado labels', () => {
    expect(component.getEstadoLabel('NUEVO')).toBe('Nuevo');
    expect(component.getEstadoLabel('ASIGNADO')).toBe('Asignado');
    expect(component.getEstadoLabel('EN_CURSO')).toBe('En Curso');
    expect(component.getEstadoLabel('COMPLETADO')).toBe('Completado');
    expect(component.getEstadoLabel('CANCELADO')).toBe('Cancelado');
    expect(component.getEstadoLabel('PENDIENTE_SEGUIMIENTO')).toBe('Pendiente Seguimiento');
  });

  it('should render estado label correctly in template', () => {
    const estadoLabel = fixture.debugElement.query(By.css('.card-status'));
    expect(estadoLabel.nativeElement.textContent).toBe('Asignado');
  });

  it('should render work around with icon prefix', () => {
    const address = fixture.debugElement.query(By.css('.card-address'));
    expect(address.nativeElement.textContent).toContain('📍');
  });
});