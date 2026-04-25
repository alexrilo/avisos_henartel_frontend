import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ClienteFormComponent } from './cliente-form.component';
import { ClienteService } from '../../application/cliente.service';
import { Cliente } from '../../domain/model/cliente.model';
import { signal } from '@angular/core';

describe('ClienteFormComponent', () => {
  let component: ClienteFormComponent;
  let fixture: ComponentFixture<ClienteFormComponent>;
  let mockService: jasmine.SpyObj<ClienteService>;

  const mockCliente: Cliente = {
    id: 1,
    tipo: 'PARTICULAR',
    nombreOrazonSocial: 'Juan Pérez',
    telefono: '123456789',
    personaContacto: 'María López',
    observaciones: 'Notas importantes',
    estado: 'ACTIVO',
    fechaCreacion: '2024-01-01T00:00:00',
    fechaModificacion: null
  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ClienteService', [
      'createCliente',
      'updateCliente',
      'getCliente'
    ]);

    await TestBed.configureTestingModule({
      imports: [ClienteFormComponent],
      providers: [
        { provide: ClienteService, useValue: mockService },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize as new cliente form', () => {
    expect(component.isEdit).toBeFalse();
    expect(component.clienteId).toBeNull();
  });

  it('should have default values for form fields', () => {
    expect(component.tipo).toBe('PARTICULAR');
    expect(component.nombreOrazonSocial).toBe('');
    expect(component.telefono).toBe('');
    expect(component.personaContacto).toBe('');
    expect(component.observaciones).toBe('');
  });

  it('should have empty error and loading signals', () => {
    expect(component.error()).toBeNull();
    expect(component.loading()).toBeFalse();
  });

  it('should return correct form title for new cliente', () => {
    expect(component.getFormTitle()).toBe('Nuevo Cliente');
  });

  it('should display "Nuevo Cliente" in title', () => {
    const titleElement = fixture.nativeElement.querySelector('h1') || fixture.nativeElement.querySelector('h2');
    if (titleElement) {
      expect(titleElement.textContent).toContain('Nuevo');
    }
  });
});

describe('ClienteFormComponent - Edit Mode', () => {
  let component: ClienteFormComponent;
  let fixture: ComponentFixture<ClienteFormComponent>;
  let mockService: jasmine.SpyObj<ClienteService>;

  const mockCliente: Cliente = {
    id: 1,
    tipo: 'EMPRESA',
    nombreOrazonSocial: 'Empresa SA',
    telefono: '987654321',
    personaContacto: 'John Smith',
    observaciones: 'Notas de empresa',
    estado: 'ACTIVO',
    fechaCreacion: '2024-01-01T00:00:00',
    fechaModificacion: '2024-02-01T00:00:00'
  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ClienteService', [
      'createCliente',
      'updateCliente',
      'getCliente'
    ]);

    mockService.getCliente.and.returnValue(Promise.resolve(mockCliente));

    await TestBed.configureTestingModule({
      imports: [ClienteFormComponent],
      providers: [
        { provide: ClienteService, useValue: mockService },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize as edit mode when id provided', () => {
    expect(component.isEdit).toBeTrue();
    expect(component.clienteId).toBe(1);
  });

  it('should return correct form title for edit', () => {
    expect(component.getFormTitle()).toBe('Editar Cliente');
  });

  it('should load cliente data on init in edit mode', () => {
    expect(mockService.getCliente).toHaveBeenCalledWith(1);
  });

  it('should populate form with cliente data', () => {
    expect(component.nombreOrazonSocial).toBe('Empresa SA');
    expect(component.telefono).toBe('987654321');
    expect(component.personaContacto).toBe('John Smith');
    expect(component.observaciones).toBe('Notas de empresa');
  });

  it('should set originalTipo from loaded cliente', () => {
    expect(component.originalTipo).toBe('EMPRESA');
    expect(component.tipo).toBe('EMPRESA');
  });

  it('should not allow changing tipo in edit mode', () => {
    // Tipo should remain as original and not be editable in edit mode
    expect(component.tipo).toBe(component.originalTipo);
  });
});

describe('ClienteFormComponent - Form Submission', () => {
  let component: ClienteFormComponent;
  let fixture: ComponentFixture<ClienteFormComponent>;
  let mockService: jasmine.SpyObj<ClienteService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ClienteService', [
      'createCliente',
      'updateCliente',
      'getCliente'
    ]);

    mockService.createCliente.and.returnValue(Promise.resolve());
    mockService.updateCliente.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [ClienteFormComponent],
      providers: [
        { provide: ClienteService, useValue: mockService },
        provideRouter([{ path: '**', redirectTo: '/dashboard/clientes' }]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call createCliente on submit in new mode', async () => {
    component.tipo = 'PARTICULAR';
    component.nombreOrazonSocial = 'Nuevo Cliente';
    component.telefono = '123456789';
    component.personaContacto = '';
    component.observaciones = '';
    fixture.detectChanges();

    await component.onSubmit();

    expect(mockService.createCliente).toHaveBeenCalledWith({
      tipo: 'PARTICULAR',
      nombreOrazonSocial: 'Nuevo Cliente',
      telefono: '123456789',
      personaContacto: undefined,
      observaciones: undefined
    });
  });

  it('should set loading state during submission', async () => {
    // Create a promise that we can control
    let resolveFn: () => void;
    const createPromise = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });
    mockService.createCliente.and.returnValue(createPromise);

    component.tipo = 'PARTICULAR';
    component.nombreOrazonSocial = 'Test';
    component.telefono = '123';
    fixture.detectChanges();

    const submitPromise = component.onSubmit();

    expect(component.loading()).toBeTrue();

    resolveFn!();
    await submitPromise;

    expect(component.loading()).toBeFalse();
  });

  it('should set error on failed submission', async () => {
    mockService.createCliente.and.returnValue(Promise.reject({ error: { message: 'Error de validación' } }));

    component.tipo = 'PARTICULAR';
    component.nombreOrazonSocial = 'Test';
    component.telefono = '123';
    fixture.detectChanges();

    await component.onSubmit();

    expect(component.error()).toBe('Error de validación');
  });
});
