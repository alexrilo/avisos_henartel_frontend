/**
 * Panel Técnico - Domain Models
 * 
 * This module contains the domain models for the technician panel feature.
 * Following Clean Architecture principles, these models have ZERO Angular dependencies.
 * They represent the core business concepts of the technician dashboard.
 */

import { Observacion } from '../../../aviso/domain/model/aviso.model';

/**
 * Summary statistics for the technician's panel.
 * Computed client-side from the assigned jobs list.
 */
export interface PanelStats {
  total: number;
  urgentes: number;
  enCurso: number;
  pendientes: number;
  completados: number;
}

/**
 * Simplified view model for a job card in the panel.
 * Derived from the full Aviso domain model.
 */
export interface TrabajoCardData {
  id: number;
  numeroCorrelativo: string;
  descripcion: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  estado: 'NUEVO' | 'ASIGNADO' | 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO' | 'PENDIENTE_SEGUIMIENTO';
  direccion: string; // Simplified: "calle, localidad"
  fechaCreacion: string;
  fechaProgramada: string | null;
  accionesDisponibles: string[]; // e.g., ['INICIAR', 'COMPLETAR', 'PENDIENTE']
}

/**
 * Full detail view model for a job.
 * Extends TrabajoCardData with additional info.
 */
export interface TrabajoDetailData extends TrabajoCardData {
  clienteId: number;
  observaciones: Observacion[];
}

/**
 * Quick action type for the panel.
 */
export type QuickAction = 'INICIAR' | 'COMPLETAR' | 'PENDIENTE' | 'CANCELAR';

/**
 * Filter options for the job list.
 */
export interface TrabajoFilter {
  estado?: string;
  search?: string;
}