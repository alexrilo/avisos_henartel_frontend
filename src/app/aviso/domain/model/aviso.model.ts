export interface DireccionServicio {
  calle: string;
  numero: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
}

export interface Observacion {
  id: number;
  contenido: string;
  tipo: string;
  usuario: string;
  fechaCreacion: string;
}

export interface Aviso {
  id: number;
  numeroCorrelativo: string;
  clienteId: number;
  descripcion: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  estado: 'NUEVO' | 'ASIGNADO' | 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO' | 'PENDIENTE_SEGUIMIENTO';
  direccion: DireccionServicio;
  fechaCreacion: string;
  fechaProgramada: string | null;
  tecnicoId: number | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  observaciones: Observacion[];
}

export interface CreateAvisoRequest {
  clienteId: number;
  descripcion: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  calle: string;
  numero: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  fechaProgramada?: string;
}

export interface UpdateAvisoRequest {
  descripcion: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  calle: string;
  numero: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  fechaProgramada?: string;
}

export interface AssignTecnicoRequest {
  tecnicoId: number;
}

export interface ChangeEstadoRequest {
  estado: string;
  tecnicoId?: number;
  observacion?: string;
}

export interface ReprogramarRequest {
  nuevaFecha: string;
  nuevoTecnicoId?: number;
}

export interface AvisoFilters {
  search?: string;
  estado?: string;
  prioridad?: string;
  clienteId?: number;
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
