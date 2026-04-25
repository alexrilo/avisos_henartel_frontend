import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AvisoFormComponent } from './aviso-form.component';
import { AvisoService } from '../../application/aviso.service';
import { signal } from '@angular/core';

describe('AvisoFormComponent', () => {
  let component: AvisoFormComponent;
  let fixture: ComponentFixture<AvisoFormComponent>;
  let mockService: jasmine.SpyObj<AvisoService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('AvisoService', [
      'createAviso',
      'updateAviso',
      'getAviso',
      'loadAvisos'
    ], {
      loading: signal(false),
      error: signal(null)
    });

    await TestBed.configureTestingModule({
      imports: [AvisoFormComponent],
      providers: [
        { provide: AvisoService, useValue: mockService },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AvisoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create as new aviso form', () => {
    expect(component).toBeTruthy();
    expect(component.isEdit).toBeFalse();
  });

  it('should display "Nuevo Aviso" title for new aviso', () => {
    expect(component.getFormTitle()).toBe('Nuevo Aviso');
  });

  it('should have form with required fields', () => {
    const form = component.form;
    expect(form).toBeTruthy();

    // Check required fields exist
    expect(form.controls['clienteId']).toBeTruthy();
    expect(form.controls['descripcion']).toBeTruthy();
    expect(form.controls['prioridad']).toBeTruthy();
    expect(form.controls['calle']).toBeTruthy();
    expect(form.controls['numero']).toBeTruthy();
    expect(form.controls['localidad']).toBeTruthy();
    expect(form.controls['provincia']).toBeTruthy();
    expect(form.controls['codigoPostal']).toBeTruthy();
  });

  it('should mark form as invalid when empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should mark form as valid when all required fields are filled', () => {
    component.form.patchValue({
      clienteId: 1,
      descripcion: 'Test description',
      prioridad: 'ALTA',
      calle: 'Calle Falsa',
      numero: '123',
      localidad: 'Madrid',
      provincia: 'Madrid',
      codigoPostal: '28001'
    });

    expect(component.form.valid).toBeTrue();
  });

  it('should show validation error when descripcion is empty', () => {
    component.form.patchValue({
      clienteId: 1,
      descripcion: '',
      prioridad: 'ALTA',
      calle: 'Calle Falsa',
      numero: '123',
      localidad: 'Madrid',
      provincia: 'Madrid',
      codigoPostal: '28001'
    });

    const descripcionControl = component.form.controls['descripcion'];
    descripcionControl.markAsTouched();
    fixture.detectChanges();

    expect(descripcionControl.valid).toBeFalse();
  });

  it('should show validation error when prioridad is empty', () => {
    component.form.patchValue({
      clienteId: 1,
      descripcion: 'Test',
      prioridad: '',
      calle: 'Calle Falsa',
      numero: '123',
      localidad: 'Madrid',
      provincia: 'Madrid',
      codigoPostal: '28001'
    });

    const prioridadControl = component.form.controls['prioridad'];
    prioridadControl.markAsTouched();
    fixture.detectChanges();

    expect(prioridadControl.valid).toBeFalse();
  });

  it('should have correct prioridad options', () => {
    expect(component.prioridadOptions.length).toBe(4);
    expect(component.prioridadOptions).toContain('BAJA');
    expect(component.prioridadOptions).toContain('MEDIA');
    expect(component.prioridadOptions).toContain('ALTA');
    expect(component.prioridadOptions).toContain('URGENTE');
  });

  it('should call createAviso when submitting new aviso', async () => {
    mockService.createAviso.and.returnValue(Promise.resolve());
    mockService.loadAvisos.and.returnValue(Promise.resolve());

    component.form.patchValue({
      clienteId: 1,
      descripcion: 'Test description',
      prioridad: 'ALTA',
      calle: 'Calle Falsa',
      numero: '123',
      localidad: 'Madrid',
      provincia: 'Madrid',
      codigoPostal: '28001'
    });

    await component.onSubmit();

    expect(mockService.createAviso).toHaveBeenCalled();
  });

  it('should show loading indicator when submitting', async () => {
    mockService.createAviso.and.returnValue(new Promise(resolve => setTimeout(resolve, 100)));
    mockService.loadAvisos.and.returnValue(Promise.resolve());

    component.form.patchValue({
      clienteId: 1,
      descripcion: 'Test',
      prioridad: 'ALTA',
      calle: 'C',
      numero: '1',
      localidad: 'L',
      provincia: 'P',
      codigoPostal: '12345'
    });

    const submitPromise = component.onSubmit();
    fixture.detectChanges();

    expect(component.loading()).toBeTrue();

    await submitPromise;
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
  });

  it('should display error message when submission fails', async () => {
    mockService.createAviso.and.returnValue(Promise.reject({ error: { message: 'Error al crear' } }));
    mockService.loadAvisos.and.returnValue(Promise.resolve());

    component.form.patchValue({
      clienteId: 1,
      descripcion: 'Test',
      prioridad: 'ALTA',
      calle: 'C',
      numero: '1',
      localidad: 'L',
      provincia: 'P',
      codigoPostal: '12345'
    });

    await component.onSubmit().catch(() => {});

    expect(component.error()).toBe('Error al crear');
  });
});

describe('AvisoFormComponent (Edit Mode)', () => {
  let component: AvisoFormComponent;
  let fixture: ComponentFixture<AvisoFormComponent>;
  let mockService: jasmine.SpyObj<AvisoService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('AvisoService', [
      'createAviso',
      'updateAviso',
      'getAviso',
      'loadAvisos'
    ], {
      loading: signal(false),
      error: signal(null)
    });

    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (param: string) => {
            if (param === 'id') return '1';
            return null;
          }
        }
      }
    };

    const mockAviso = {
      id: 1,
      numeroCorrelativo: 'AVI-2026-0001',
      clienteId: 1,
      descripcion: 'Existing aviso',
      prioridad: 'ALTA',
      estado: 'NUEVO',
      direccion: {
        calle: 'Calle Existente',
        numero: '999',
        locality: 'Madrid',
        provincia: 'Madrid',
        codigoPostal: '28001'
      },
      fechaCreacion: '2026-01-01T00:00:00',
      fechaProgramada: null,
      tecnicoId: null,
      fechaInicio: null,
      fechaFin: null,
      observaciones: []
    };

    mockService.getAviso.and.returnValue(Promise.resolve(mockAviso as any));
    mockService.loading.set(true);

    await TestBed.configureTestingModule({
      imports: [AvisoFormComponent],
      providers: [
        { provide: AvisoService, useValue: mockService },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AvisoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be in edit mode when id is provided', () => {
    expect(component.isEdit).toBeTrue();
  });

  it('should display "Editar Aviso" title for edit mode', () => {
    expect(component.getFormTitle()).toBe('Editar Aviso');
  });

  it('should load existing aviso data when in edit mode', () => {
    expect(mockService.getAviso).toHaveBeenCalledWith(1);
  });

  it('should call updateAviso when submitting in edit mode', async () => {
    mockService.updateAviso.and.returnValue(Promise.resolve());
    mockService.loadAvisos.and.returnValue(Promise.resolve());

    component.form.patchValue({
      descripcion: 'Updated description',
      prioridad: 'MEDIA',
      calle: 'Nueva Calle',
      numero: '456',
      localidad: 'Barcelona',
      provincia: 'Barcelona',
      codigoPostal: '08001'
    });

    await component.onSubmit();

    expect(mockService.updateAviso).toHaveBeenCalledWith(1, jasmine.objectContaining({
      descripcion: 'Updated description',
      prioridad: 'MEDIA'
    }));
  });
});