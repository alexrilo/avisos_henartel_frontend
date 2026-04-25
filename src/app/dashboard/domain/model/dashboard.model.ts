export interface DashboardMetrics {
  pendientes: number;
  asignados: number;
  enCurso: number;
  completadosHoy: number;
  urgentesPendientes: number;
  enSeguimiento: number;
  tecnicosActivos: number;
  creadosHoy: number;
  cerradosHoy: number;
}

export interface TechnicianWorkload {
  tecnicoId: number;
  nombre: string;
  activeJobsCount: number;
}

export interface ScheduledJob {
  avisoId: number;
  numeroCorrelativo: string;
  clienteNombre: string;
  direccion: string;
  fechaProgramada: string;
  tecnicoId: number;
}

export interface UrgentAvisoSummary {
  id: number;
  numeroCorrelativo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  direccion: string;
}

export interface TodayJobSummary {
  id: number;
  numeroCorrelativo: string;
  tecnicoNombre: string;
  estado: string;
}

export interface DashboardFilters {
  dateFrom: string;
  dateTo: string;
  tecnicoId?: number;
  prioridad?: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  urgentList: UrgentAvisoSummary[];
  todayJobs: TodayJobSummary[];
  technicianWorkload: TechnicianWorkload[];
  scheduledJobs: ScheduledJob[];
  chartByState: [string, number][];
  chartByTechnician: [string, number][];
}