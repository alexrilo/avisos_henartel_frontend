import { TestBed } from '@angular/core/testing';
import { PanelTecnicoService } from './panel-tecnico.service';
import { PANEL_TECNICO_REPOSITORY_TOKEN, PanelTecnicoRepositoryPort } from '../domain/port/panel-tecnico.repository.port';
import { AuthService } from '../../auth/application/auth.service';
import { signal } from '@angular/core';
import { Aviso } from '../../aviso/domain/model/aviso.model';

describe('PanelTecnicoService', () => {
  let service: PanelTecnicoService;
  let mockRepository: jasmine.SpyObj<PanelTecnicoRepositoryPort>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockAviso: Aviso = {
    id: 1,
    numeroCorrelativo: 'AVI-2024-0001',
    clienteId: 1,
    descripcion: 'Test trabajo',
    prioridad: 'URGENTE',
    estado: 'ASIGNADO',
    direccion: {
      calle: 'Calle Falsa',
      numero: '123',
      localidad: 'Madrid',
      provincia: 'Madrid',
      codigoPostal: '28001'
    },
    fechaCreacion: '2024-01-01T00:00:00',
    fechaProgramada: null,
    tecnicoId: 1,
    fechaInicio: null,
    fechaFin: null,
    observaciones: []
  };

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('PanelTecnicoRepositoryPort', [
      'getMisTrabajos',
      'changeEstado',
      'getAviso'
    ]);

    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'isLoggedIn'], {
      user: signal({
        userId: 1,
        username: 'tech1',
        role: 'TECNICO',
        accessToken: 'token123',
        tokenType: 'Bearer'
      })
    });

    TestBed.configureTestingModule({
      providers: [
        PanelTecnicoService,
        { provide: PANEL_TECNICO_REPOSITORY_TOKEN, useValue: mockRepository },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(PanelTecnicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty trabajos', () => {
    expect(service.trabajos()).toEqual([]);
    expect(service.loading()).toBeFalse();
    expect(service.error()).toBeNull();
  });

  it('should compute stats from loaded jobs', async () => {
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve([mockAviso]));

    await service.loadTrabajos();

    expect(service.stats().total).toBe(1);
    expect(service.stats().urgentes).toBe(1);
    expect(service.stats().pendientes).toBe(1);
  });

  it('should compute correct stats for multiple jobs', async () => {
    const mockAvisos: Aviso[] = [
      { ...mockAviso, id: 1, prioridad: 'URGENTE', estado: 'ASIGNADO' },
      { ...mockAviso, id: 2, prioridad: 'ALTA', estado: 'EN_CURSO' },
      { ...mockAviso, id: 3, prioridad: 'MEDIA', estado: 'ASIGNADO' },
      { ...mockAviso, id: 4, prioridad: 'BAJA', estado: 'COMPLETADO' }
    ];
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve(mockAvisos));

    await service.loadTrabajos();

    expect(service.stats().total).toBe(4);
    expect(service.stats().urgentes).toBe(1);
    expect(service.stats().enCurso).toBe(1);
    expect(service.stats().pendientes).toBe(2);
    expect(service.stats().completados).toBe(1);
  });

  it('should exclude completed and cancelled from urgent count', async () => {
    const mockAvisos: Aviso[] = [
      { ...mockAviso, id: 1, prioridad: 'URGENTE', estado: 'COMPLETADO' },
      { ...mockAviso, id: 2, prioridad: 'URGENTE', estado: 'CANCELADO' }
    ];
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve(mockAvisos));

    await service.loadTrabajos();

    expect(service.stats().urgentes).toBe(0);
  });

  it('should load jobs for current technician', async () => {
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve([mockAviso]));

    await service.loadTrabajos();

    expect(mockRepository.getMisTrabajos).toHaveBeenCalledWith(1);
    expect(service.trabajos().length).toBe(1);
  });

  it('should set error when technician ID is missing', async () => {
    mockAuthService.user.set({
      userId: undefined as any,
      username: '',
      role: 'TECNICO',
      accessToken: '',
      tokenType: 'Bearer'
    });
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve([]));

    await service.loadTrabajos();

    expect(service.error()).toBe('No se pudo identificar al técnico');
  });

  it('should set error when loading fails', async () => {
    mockRepository.getMisTrabajos.and.returnValue(
      Promise.reject({ error: { message: 'Error de red' } })
    );

    await service.loadTrabajos();

    expect(service.error()).toBe('Error de red');
    expect(service.loading()).toBeFalse();
  });

  it('should set generic error when loading fails without message', async () => {
    mockRepository.getMisTrabajos.and.returnValue(Promise.reject(new Error('Failed')));

    await service.loadTrabajos();

    expect(service.error()).toBe('Error al cargar mis trabajos');
    expect(service.loading()).toBeFalse();
  });

  it('should change estado and reload trabajos', async () => {
    mockRepository.changeEstado.and.returnValue(Promise.resolve());
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve([]));

    await service.cambiarEstado(1, 'EN_CURSO');

    expect(mockRepository.changeEstado).toHaveBeenCalledWith(1, { estado: 'EN_CURSO' });
    expect(mockRepository.getMisTrabajos).toHaveBeenCalled();
  });

  it('should set error when changing estado fails', async () => {
    mockRepository.changeEstado.and.returnValue(
      Promise.reject({ error: { message: 'Error al cambiar estado' } })
    );

    await service.cambiarEstado(1, 'EN_CURSO').catch(() => {});

    expect(service.error()).toBe('Error al cambiar estado');
  });

  it('should get trabajo detail', async () => {
    mockRepository.getAviso.and.returnValue(Promise.resolve(mockAviso));

    const result = await service.getTrabajoDetail(1);

    expect(mockRepository.getAviso).toHaveBeenCalledWith(1, 1);
    expect(result).toBeTruthy();
    expect(result?.numeroCorrelativo).toBe('AVI-2024-0001');
  });

  it('should return null when get detail fails', async () => {
    mockRepository.getAviso.and.returnValue(Promise.reject(new Error('Failed')));

    const result = await service.getTrabajoDetail(1);

    expect(result).toBeNull();
    expect(service.error()).toBe('Error al cargar detalle');
  });

  it('should update filter', () => {
    service.updateFilter({ estado: 'EN_CURSO' });

    expect(service.filter().estado).toBe('EN_CURSO');
  });

  it('should merge filter updates', () => {
    service.updateFilter({ estado: 'EN_CURSO' });
    service.updateFilter({ search: 'test' });

    expect(service.filter().estado).toBe('EN_CURSO');
    expect(service.filter().search).toBe('test');
  });

  it('should filter cards by estado', async () => {
    const mockAvisos: Aviso[] = [
      { ...mockAviso, id: 1, estado: 'ASIGNADO' },
      { ...mockAviso, id: 2, estado: 'EN_CURSO' }
    ];
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve(mockAvisos));

    await service.loadTrabajos();
    service.updateFilter({ estado: 'EN_CURSO' });

    expect(service.cards().length).toBe(1);
    expect(service.cards()[0].estado).toBe('EN_CURSO');
  });

  it('should filter cards by search term', async () => {
    const mockAvisos: Aviso[] = [
      { ...mockAviso, id: 1, numeroCorrelativo: 'AVI-2024-0001', descripcion: 'Trabajo gas' },
      { ...mockAviso, id: 2, numeroCorrelativo: 'AVI-2024-0002', descripcion: 'Trabajo agua' }
    ];
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve(mockAvisos));

    await service.loadTrabajos();
    service.updateFilter({ search: 'gas' });

    expect(service.cards().length).toBe(1);
    expect(service.cards()[0].descripcion).toContain('gas');
  });

  it('should map aviso to card data correctly', async () => {
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve([mockAviso]));

    await service.loadTrabajos();

    const card = service.cards()[0];
    expect(card.id).toBe(1);
    expect(card.numeroCorrelativo).toBe('AVI-2024-0001');
    expect(card.descripcion).toBe('Test trabajo');
    expect(card.prioridad).toBe('URGENTE');
    expect(card.estado).toBe('ASIGNADO');
  });

  it('should map actions available for ASIGNADO estado', async () => {
    const assignedAviso: Aviso = { ...mockAviso, estado: 'ASIGNADO' };
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve([assignedAviso]));

    await service.loadTrabajos();

    const card = service.cards()[0];
    expect(card.accionesDisponibles).toContain('INICIAR');
    expect(card.accionesDisponibles).toContain('CANCELAR');
  });

  it('should map actions available for EN_CURSO estado', async () => {
    const inProgressAviso: Aviso = { ...mockAviso, estado: 'EN_CURSO' };
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve([inProgressAviso]));

    await service.loadTrabajos();

    const card = service.cards()[0];
    expect(card.accionesDisponibles).toContain('COMPLETAR');
    expect(card.accionesDisponibles).toContain('PENDIENTE');
    expect(card.accionesDisponibles).toContain('CANCELAR');
  });

  it('should map actions available for PENDIENTE_SEGUIMIENTO estado', async () => {
    const pendingAviso: Aviso = { ...mockAviso, estado: 'PENDIENTE_SEGUIMIENTO' };
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve([pendingAviso]));

    await service.loadTrabajos();

    const card = service.cards()[0];
    expect(card.accionesDisponibles).toContain('REINICIAR');
    expect(card.accionesDisponibles).toContain('CANCELAR');
  });

  it('should map no actions for COMPLETADO estado', async () => {
    const completedAviso: Aviso = { ...mockAviso, estado: 'COMPLETADO' };
    mockRepository.getMisTrabajos.and.returnValue(Promise.resolve([completedAviso]));

    await service.loadTrabajos();

    const card = service.cards()[0];
    expect(card.accionesDisponibles).toEqual([]);
  });

  it('should include observaciones in detail data', async () => {
    const avisoWithObservaciones: Aviso = {
      ...mockAviso,
      observaciones: [
        {
          id: 1,
          contenido: 'Primera observación',
          tipo: 'INFO',
          usuario: 'admin',
          fechaCreacion: '2024-01-02T10:00:00'
        }
      ]
    };
    mockRepository.getAviso.and.returnValue(Promise.resolve(avisoWithObservaciones));

    const result = await service.getTrabajoDetail(1);

    expect(result?.observaciones.length).toBe(1);
    expect(result?.observaciones[0].contenido).toBe('Primera observación');
  });
});