import { TestBed } from '@angular/core/testing';
import { ClienteService } from './cliente.service';
import { CLIENTE_REPOSITORY_TOKEN } from '../domain/port/cliente.repository.port';
import { Cliente, PaginatedResponse } from '../domain/model/cliente.model';
import { TestScheduler } from 'rxjs/testing';

describe('ClienteService', () => {
  let service: ClienteService;
  let mockRepository: jasmine.SpyObj<typeof CLIENTE_REPOSITORY_TOKEN>;

  const mockCliente: Cliente = {
    id: 1,
    tipo: 'PARTICULAR',
    nombreOrazonSocial: 'Juan Pérez',
    telefono: '123456789',
    personaContacto: null,
    observaciones: null,
    estado: 'ACTIVO',
    fechaCreacion: '2024-01-01T00:00:00',
    fechaModificacion: null
  };

  beforeEach(() => {
    const mockRepo = jasmine.createSpyObj('ClienteRepositoryPort', [
      'getClientes',
      'createCliente',
      'updateCliente',
      'getCliente',
      'toggleClienteStatus'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ClienteService,
        { provide: CLIENTE_REPOSITORY_TOKEN, useValue: mockRepo }
      ]
    });

    service = TestBed.inject(ClienteService);
    mockRepository = TestBed.inject(CLIENTE_REPOSITORY_TOKEN) as jasmine.SpyObj<typeof CLIENTE_REPOSITORY_TOKEN>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty clientes', () => {
    expect(service.clientes()).toEqual([]);
  });

  it('should load clientes and update state', async () => {
    const mockResponse: PaginatedResponse<Cliente> = {
      content: [mockCliente],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    };
    mockRepository.getClientes.and.returnValue(Promise.resolve(mockResponse));

    await service.loadClientes();

    expect(service.clientes().length).toBe(1);
    expect(service.clientes()[0].nombreOrazonSocial).toBe('Juan Pérez');
    expect(service.loading()).toBeFalse();
  });

  it('should set error when loadClientes fails', async () => {
    mockRepository.getClientes.and.returnValue(Promise.reject({ error: { message: 'Error de red' } }));

    await service.loadClientes();

    expect(service.error()).toBe('Error de red');
    expect(service.loading()).toBeFalse();
  });

  it('should set generic error when loadClientes fails without message', async () => {
    mockRepository.getClientes.and.returnValue(Promise.reject(new Error('Failed')));

    await service.loadClientes();

    expect(service.error()).toBe('Error al cargar clientes');
    expect(service.loading()).toBeFalse();
  });

  it('should update pagination state after loadClientes', async () => {
    const mockResponse: PaginatedResponse<Cliente> = {
      content: [mockCliente],
      totalElements: 50,
      totalPages: 3,
      currentPage: 1,
      pageSize: 20
    };
    mockRepository.getClientes.and.returnValue(Promise.resolve(mockResponse));

    await service.loadClientes();

    expect(service.pagination().totalElements).toBe(50);
    expect(service.pagination().totalPages).toBe(3);
    expect(service.pagination().currentPage).toBe(1);
  });

  it('should create cliente and reload', async () => {
    mockRepository.createCliente.and.returnValue(Promise.resolve(mockCliente));
    mockRepository.getClientes.and.returnValue(Promise.resolve({
      content: [mockCliente],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));

    await service.createCliente({ tipo: 'PARTICULAR', nombreOrazonSocial: 'Juan', telefono: '123' });

    expect(mockRepository.createCliente).toHaveBeenCalledWith({
      tipo: 'PARTICULAR',
      nombreOrazonSocial: 'Juan',
      telefono: '123'
    });
  });

  it('should set error when createCliente fails', async () => {
    mockRepository.createCliente.and.returnValue(Promise.reject({ error: { message: 'Error al crear' } }));

    await service.createCliente({ tipo: 'PARTICULAR', nombreOrazonSocial: 'Test', telefono: '123' })
      .catch(() => {});

    expect(service.error()).toBe('Error al crear');
    expect(service.loading()).toBeFalse();
  });

  it('should update cliente and reload', async () => {
    mockRepository.updateCliente.and.returnValue(Promise.resolve());
    mockRepository.getClientes.and.returnValue(Promise.resolve({
      content: [mockCliente],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));

    await service.updateCliente(1, { nombreOrazonSocial: 'Updated', telefono: '999' });

    expect(mockRepository.updateCliente).toHaveBeenCalledWith(1, { nombreOrazonSocial: 'Updated', telefono: '999' });
  });

  it('should set error when updateCliente fails', async () => {
    mockRepository.updateCliente.and.returnValue(Promise.reject({ error: { message: 'Error al actualizar' } }));

    await service.updateCliente(1, { nombreOrazonSocial: 'Test', telefono: '123' })
      .catch(() => {});

    expect(service.error()).toBe('Error al actualizar cliente');
  });

  it('should toggle cliente status and reload', async () => {
    mockRepository.toggleClienteStatus.and.returnValue(Promise.resolve());
    mockRepository.getClientes.and.returnValue(Promise.resolve({
      content: [{ ...mockCliente, estado: 'INACTIVO' }],
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));

    await service.toggleClienteStatus(1);

    expect(mockRepository.toggleClienteStatus).toHaveBeenCalledWith(1);
  });

  it('should set error when toggleClienteStatus fails', async () => {
    mockRepository.toggleClienteStatus.and.returnValue(Promise.reject({ error: { message: 'Error al cambiar estado' } }));

    await service.toggleClienteStatus(1)
      .catch(() => {});

    expect(service.error()).toBe('Error al cambiar estado');
  });

  it('should update search with page 0', async () => {
    mockRepository.getClientes.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20
    }));

    service.updateSearch('Juan');

    expect(mockRepository.getClientes).toHaveBeenCalledWith(
      jasmine.objectContaining({ search: 'Juan', page: 0 })
    );
  });

  it('should update page', async () => {
    mockRepository.getClientes.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 2,
      pageSize: 20
    }));

    service.updatePage(2);

    expect(mockRepository.getClientes).toHaveBeenCalledWith(
      jasmine.objectContaining({ page: 2 })
    );
  });

  it('should get cliente by id', async () => {
    mockRepository.getCliente.and.returnValue(Promise.resolve(mockCliente));

    const result = await service.getCliente(1);

    expect(mockRepository.getCliente).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockCliente);
  });

  it('should compute hasPreviousPage correctly', async () => {
    mockRepository.getClientes.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20
    }));

    await service.loadClientes();

    expect(service.hasPreviousPage()).toBeFalse();
  });

  it('should compute hasNextPage correctly when more pages available', async () => {
    mockRepository.getClientes.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 50,
      totalPages: 3,
      currentPage: 1,
      pageSize: 20
    }));

    await service.loadClientes();

    expect(service.hasNextPage()).toBeTrue();
  });

  it('should compute hasNextPage correctly when on last page', async () => {
    mockRepository.getClientes.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 20,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));

    await service.loadClientes();

    expect(service.hasNextPage()).toBeFalse();
  });

  it('should pass filters to repository when loading clientes', async () => {
    mockRepository.getClientes.and.returnValue(Promise.resolve({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10
    }));

    await service.loadClientes({ estado: 'ACTIVO', tipo: 'EMPRESA', size: 10 });

    expect(mockRepository.getClientes).toHaveBeenCalledWith(
      jasmine.objectContaining({ estado: 'ACTIVO', tipo: 'EMPRESA', size: 10 })
    );
  });
});
