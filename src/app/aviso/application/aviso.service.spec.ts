import { TestBed } from '@angular/core/testing';
import { AvisoService } from './aviso.service';
import { AVISO_REPOSITORY_TOKEN } from '../domain/port/aviso.repository.port';
import { Aviso, PaginatedResponse } from '../domain/model/aviso.model';

describe('AvisoService', () => {
  let service: AvisoService;
  let mockRepository: jasmine.SpyObj<typeof AVISO_REPOSITORY_TOKEN>;

  const mockAviso: Aviso = {
    id: 1,
    numeroCorrelativo: 'AVI-2026-0001',
    clienteId: 1,
    descripcion: 'Test description',
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
  };

  beforeEach(() => {
    const mockRepo = jasmine.createSpyObj('AvisoRepositoryPort', [
      'getAvisos',
      'createAviso',
      'updateAviso',
      'cancelar',
      'assignTecnico',
      'changeEstado',
      'reprogramar',
      'getAviso',
      'getMisTrabajos'
    ]);

    TestBed.configureTestingModule({
      providers: [
        AvisoService,
        { provide: AVISO_REPOSITORY_TOKEN, useValue: mockRepo }
      ]
    });

    service = TestBed.inject(AvisoService);
    mockRepository = TestBed.inject(AVISO_REPOSITORY_TOKEN) as jasmine.SpyObj<typeof AVISO_REPOSITORY_TOKEN>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty avisos', () => {
    expect(service.avisos()).toEqual([]);
  });

  it('should load avisos and update state', async () => {
    const mockResponse: PaginatedResponse<Aviso> = {
      content: [mockAviso],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    };
    mockRepository.getAvisos.and.returnValue(Promise.resolve(mockResponse));

    await service.loadAvisos();

    expect(service.avisos().length).toBe(1);
    expect(service.avisos()[0].descripcion).toBe('Test description');
    expect(service.loading()).toBeFalse();
  });

  it('should set error when loadAvisos fails', async () => {
    mockRepository.getAvisos.and.returnValue(Promise.reject({ error: { message: 'Error de red' } }));

    await service.loadAvisos();

    expect(service.error()).toBe('Error de red');
    expect(service.loading()).toBeFalse();
  });

  it('should set generic error when loadAvisos fails without message', async () => {
    mockRepository.getAvisos.and.returnValue(Promise.reject(new Error('Failed')));

    await service.loadAvisos();

    expect(service.error()).toBe('Error al cargar avisos');
    expect(service.loading()).toBeFalse();
  });

  it('should update pagination state after loadAvisos', async () => {
    const mockResponse: PaginatedResponse<Aviso> = {
      content: [mockAviso],
      totalElements: 50,
      totalPages: 3,
      currentPage: 1,
      pageSize: 20
    };
    mockRepository.getAvisos.and.returnValue(Promise.resolve(mockResponse));

    await service.loadAvisos();

    expect(service.pagination().totalElements).toBe(50);
    expect(service.pagination().totalPages).toBe(3);
    expect(service.pagination().currentPage).toBe(1);
  });

  it('should create aviso and reload', async () => {
    mockRepository.createAviso.and.returnValue(Promise.resolve(mockAviso));
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [mockAviso],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));

    await service.createAviso({
      clienteId: 1,
      descripcion: 'Test',
      prioridad: 'ALTA',
      calle: 'Calle Falsa',
      numero: '123',
      localidad: 'Madrid',
      provincia: 'Madrid',
      codigoPostal: '28001'
    });

    expect(mockRepository.createAviso).toHaveBeenCalledWith({
      clienteId: 1,
      descripcion: 'Test',
      prioridad: 'ALTA',
      calle: 'Calle Falsa',
      numero: '123',
      localidad: 'Madrid',
      provincia: 'Madrid',
      codigoPostal: '28001'
    });
  });

  it('should set error when createAviso fails', async () => {
    mockRepository.createAviso.and.returnValue(Promise.reject({ error: { message: 'Error al crear' } }));

    await service.createAviso({
      clienteId: 1,
      descripcion: 'Test',
      prioridad: 'ALTA',
      calle: 'C',
      numero: '1',
      localidad: 'L',
      provincia: 'P',
      codigoPostal: '12345'
    }).catch(() => {});

    expect(service.error()).toBe('Error al crear');
    expect(service.loading()).toBeFalse();
  });

  it('should update aviso and reload', async () => {
    mockRepository.updateAviso.and.returnValue(Promise.resolve());
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [mockAviso],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));

    await service.updateAviso(1, {
      descripcion: 'Updated',
      prioridad: 'URGENTE',
      calle: 'Nueva',
      numero: '456',
      localidad: 'Barcelona',
      provincia: 'Barcelona',
      codigoPostal: '08001'
    });

    expect(mockRepository.updateAviso).toHaveBeenCalledWith(1, {
      descripcion: 'Updated',
      prioridad: 'URGENTE',
      calle: 'Nueva',
      numero: '456',
      localidad: 'Barcelona',
      provincia: 'Barcelona',
      codigoPostal: '08001'
    });
  });

  it('should set error when updateAviso fails', async () => {
    mockRepository.updateAviso.and.returnValue(Promise.reject({ error: { message: 'Error al actualizar' } }));

    await service.updateAviso(1, {
      descripcion: 'Test',
      prioridad: 'ALTA',
      calle: 'C',
      numero: '1',
      localidad: 'L',
      provincia: 'P',
      codigoPostal: '12345'
    }).catch(() => {});

    expect(service.error()).toBe('Error al actualizar aviso');
  });

  it('should cancelar aviso and reload', async () => {
    mockRepository.cancelar.and.returnValue(Promise.resolve());
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20
    }));

    await service.cancelar(1);

    expect(mockRepository.cancelar).toHaveBeenCalledWith(1);
  });

  it('should set error when cancelar fails', async () => {
    mockRepository.cancelar.and.returnValue(Promise.reject({ error: { message: 'Error al cancelar' } }));

    await service.cancelar(1).catch(() => {});

    expect(service.error()).toBe('Error al cancelar aviso');
  });

  it('should update search with page 0', async () => {
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20
    }));

    service.updateSearch('Test search');

    expect(mockRepository.getAvisos).toHaveBeenCalledWith(
      jasmine.objectContaining({ search: 'Test search', page: 0 })
    );
  });

  it('should update page', async () => {
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 2,
      pageSize: 20
    }));

    service.updatePage(2);

    expect(mockRepository.getAvisos).toHaveBeenCalledWith(
      jasmine.objectContaining({ page: 2 })
    );
  });

  it('should update filter with page 0', async () => {
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20
    }));

    service.updateFilter('estado', 'NUEVO');

    expect(mockRepository.getAvisos).toHaveBeenCalledWith(
      jasmine.objectContaining({ estado: 'NUEVO', page: 0 })
    );
  });

  it('should get aviso by id', async () => {
    mockRepository.getAviso.and.returnValue(Promise.resolve(mockAviso));

    const result = await service.getAviso(1);

    expect(mockRepository.getAviso).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockAviso);
  });

  it('should compute hasPreviousPage correctly', async () => {
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20
    }));

    await service.loadAvisos();

    expect(service.hasPreviousPage()).toBeFalse();
  });

  it('should compute hasNextPage correctly when more pages available', async () => {
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 50,
      totalPages: 3,
      currentPage: 1,
      pageSize: 20
    }));

    await service.loadAvisos();

    expect(service.hasNextPage()).toBeTrue();
  });

  it('should compute hasNextPage correctly when on last page', async () => {
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 20,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));

    await service.loadAvisos();

    expect(service.hasNextPage()).toBeFalse();
  });

  it('should pass filters to repository when loading avisos', async () => {
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10
    }));

    await service.loadAvisos({ estado: 'NUEVO', prioridad: 'ALTA', size: 10 });

    expect(mockRepository.getAvisos).toHaveBeenCalledWith(
      jasmine.objectContaining({ estado: 'NUEVO', prioridad: 'ALTA', size: 10 })
    );
  });

  it('should assign tecnico and reload', async () => {
    mockRepository.assignTecnico.and.returnValue(Promise.resolve());
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [mockAviso],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));

    await service.assignTecnico(1, { tecnicoId: 5 });

    expect(mockRepository.assignTecnico).toHaveBeenCalledWith(1, { tecnicoId: 5 });
  });

  it('should change estado and reload', async () => {
    mockRepository.changeEstado.and.returnValue(Promise.resolve());
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [mockAviso],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));

    await service.changeEstado(1, { estado: 'EN_CURSO', tecnicoId: 5 });

    expect(mockRepository.changeEstado).toHaveBeenCalledWith(1, { estado: 'EN_CURSO', tecnicoId: 5 });
  });

  it('should reprogramar and reload', async () => {
    mockRepository.reprogramar.and.returnValue(Promise.resolve());
    mockRepository.getAvisos.and.returnValue(Promise.resolve({
      content: [mockAviso],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));

    await service.reprogramar(1, { nuevaFecha: '2026-05-01T10:00:00' });

    expect(mockRepository.reprogramar).toHaveBeenCalledWith(1, { nuevaFecha: '2026-05-01T10:00:00' });
  });
});