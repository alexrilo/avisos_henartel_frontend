import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { ClienteListComponent } from './cliente-list.component';
import { ClienteService } from '../../application/cliente.service';
import { Cliente } from '../../domain/model/cliente.model';

describe('ClienteListComponent', () => {
  let component: ClienteListComponent;
  let fixture: ComponentFixture<ClienteListComponent>;
  let mockService: jasmine.SpyObj<ClienteService>;

  const mockClientes: Cliente[] = [
    {
      id: 1,
      tipo: 'PARTICULAR',
      nombreOrazonSocial: 'Juan Pérez',
      telefono: '123456789',
      personaContacto: 'María López',
      observaciones: null,
      estado: 'ACTIVO',
      fechaCreacion: '2024-01-01T00:00:00',
      fechaModificacion: null
    },
    {
      id: 2,
      tipo: 'EMPRESA',
      nombreOrazonSocial: 'Empresa SA',
      telefono: '987654321',
      personaContacto: 'John Smith',
      observaciones: 'Notas',
      estado: 'INACTIVO',
      fechaCreacion: '2024-01-15T00:00:00',
      fechaModificacion: '2024-02-01T00:00:00'
    }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ClienteService', [
      'loadClientes',
      'updateSearch',
      'loadClientes',
      'updatePage',
      'toggleClienteStatus'
    ]);

    mockService.clientes = jasmine.createSpyObj('clientes', ['subscribe']).and.returnValue(mockClientes);
    mockService.loading = jasmine.createSpyObj('loading', ['subscribe']).and.returnValue(() => false);
    mockService.error = jasmine.createSpyObj('error', ['subscribe']).and.returnValue(() => null);
    mockService.pagination = jasmine.createSpyObj('pagination', ['subscribe']).and.returnValue(() => ({
      totalElements: 2,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20
    }));
    mockService.hasPreviousPage = jasmine.createSpyObj('hasPreviousPage', ['subscribe']).and.returnValue(() => false);
    mockService.hasNextPage = jasmine.createSpyObj('hasNextPage', ['subscribe']).and.returnValue(() => false);

    // Make the service return proper signals for testing
    Object.defineProperty(mockService, 'clientes', {
      get: () => () => mockClientes
    });
    Object.defineProperty(mockService, 'loading', {
      get: () => () => false
    });
    Object.defineProperty(mockService, 'error', {
      get: () => () => null
    });
    Object.defineProperty(mockService, 'pagination', {
      get: () => () => ({ totalElements: 2, totalPages: 1, currentPage: 0, pageSize: 20 })
    });
    Object.defineProperty(mockService, 'hasPreviousPage', {
      get: () => () => false
    });
    Object.defineProperty(mockService, 'hasNextPage', {
      get: () => () => false
    });

    await TestBed.configureTestingModule({
      imports: [ClienteListComponent],
      providers: [
        { provide: ClienteService, useValue: mockService },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load clientes on init', () => {
    expect(mockService.loadClientes).toHaveBeenCalled();
  });

  it('should display empty message when no clientes', () => {
    // Override the service to return empty clientes
    Object.defineProperty(mockService, 'clientes', {
      get: () => () => []
    });
    fixture.detectChanges();

    const emptyMsg = fixture.debugElement.query(By.css('.empty'));
    expect(emptyMsg).toBeTruthy();
  });

  it('should display loading message when loading', () => {
    Object.defineProperty(mockService, 'loading', {
      get: () => () => true
    });
    fixture.detectChanges();

    const loadingMsg = fixture.debugElement.query(By.css('.loading'));
    expect(loadingMsg).toBeTruthy();
  });

  it('should display error message when error', () => {
    Object.defineProperty(mockService, 'error', {
      get: () => () => 'Error de red'
    });
    fixture.detectChanges();

    const errorMsg = fixture.debugElement.query(By.css('.error'));
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.nativeElement.textContent).toBe('Error de red');
  });

  it('should render table when clientes exist', () => {
    const table = fixture.debugElement.query(By.css('table'));
    expect(table).toBeTruthy();
  });

  it('should render correct number of rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
  });

  it('should display cliente data correctly', () => {
    const firstRow = fixture.debugElement.queryAll(By.css('tbody tr'))[0];
    const cells = firstRow.queryAll(By.css('td'));

    expect(cells[0].nativeElement.textContent).toContain('Juan Pérez');
    expect(cells[1].nativeElement.textContent).toContain('Particular');
    expect(cells[2].nativeElement.textContent).toContain('123456789');
    expect(cells[3].nativeElement.textContent).toContain('María López');
  });

  it('should display active status correctly', () => {
    const statusSpan = fixture.debugElement.query(By.css('.status-active'));
    expect(statusSpan).toBeTruthy();
    expect(statusSpan.nativeElement.textContent).toContain('Activo');
  });

  it('should display inactive status correctly', () => {
    const statusSpan = fixture.debugElement.query(By.css('.status-inactive'));
    expect(statusSpan).toBeTruthy();
    expect(statusSpan.nativeElement.textContent).toContain('Inactivo');
  });

  it('should call onSearch when search button clicked', () => {
    component.search.set('Juan');
    fixture.detectChanges();

    const searchButton = fixture.debugElement.query(By.css('button'));
    searchButton.triggerEventHandler('click', null);

    expect(mockService.updateSearch).toHaveBeenCalledWith('Juan');
  });

  it('should call loadClientes with filter when filter changed', () => {
    const estadoSelect = fixture.debugElement.query(By.css('.filter-select'));
    estadoSelect.triggerEventHandler('change', { target: { value: 'ACTIVO' } });

    expect(mockService.loadClientes).toHaveBeenCalledWith(jasmine.objectContaining({ estado: 'ACTIVO', page: 0 }));
  });

  it('should show pagination when clientes exist', () => {
    const pagination = fixture.debugElement.query(By.css('.pagination'));
    expect(pagination).toBeTruthy();
  });

  it('should display page info correctly', () => {
    const pageInfo = fixture.debugElement.query(By.css('.page-info'));
    expect(pageInfo.nativeElement.textContent).toContain('Página 1 de 1');
  });

  it('should disable previous button on first page', () => {
    const prevButton = fixture.debugElement.queryAll(By.css('button'))[0];
    expect(prevButton.nativeElement.disabled).toBeTrue();
  });

  it('should call onPageChange when next button clicked', () => {
    Object.defineProperty(mockService, 'hasNextPage', {
      get: () => () => true
    });
    fixture.detectChanges();

    const nextButton = fixture.debugElement.queryAll(By.css('button'))[1];
    nextButton.triggerEventHandler('click', null);

    expect(mockService.updatePage).toHaveBeenCalledWith(1);
  });

  it('should return correct label for PARTICULAR tipo', () => {
    expect(component.getTipoLabel('PARTICULAR')).toBe('Particular');
  });

  it('should return correct label for EMPRESA tipo', () => {
    expect(component.getTipoLabel('EMPRESA')).toBe('Empresa');
  });
});
