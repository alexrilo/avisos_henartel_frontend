export interface Cliente {
  id: number;
  tipo: 'PARTICULAR' | 'EMPRESA';
  nombreOrazonSocial: string;
  telefono: string;
  personaContacto: string | null;
  observaciones: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion: string;
  fechaModificacion: string | null;
}

export interface CreateClienteRequest {
  tipo: 'PARTICULAR' | 'EMPRESA';
  nombreOrazonSocial: string;
  telefono: string;
  personaContacto?: string;
  observaciones?: string;
}

export interface UpdateClienteRequest {
  nombreOrazonSocial: string;
  telefono: string;
  personaContacto?: string;
  observaciones?: string;
}

export interface ClienteFilters {
  search?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
  tipo?: 'PARTICULAR' | 'EMPRESA';
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}