/**
 * Panel Técnico - Repository Port
 * 
 * Panel Técnico reuses the existing AvisoRepositoryPort.
 * This file re-exports it for clarity and future extensibility.
 * 
 * The port provides:
 * - getMisTrabajos(tecnicoId): Promise<Aviso[]>
 * - getAviso(id, tecnicoId?): Promise<Aviso>
 * - changeEstado(id, request): Promise<Aviso>
 * 
 * Following Clean Architecture, this port belongs to the domain layer
 * and defines the contract that the infrastructure must implement.
 */

export { AVISO_REPOSITORY_TOKEN as PANEL_TECNICO_REPOSITORY_TOKEN } from '../../../aviso/domain/port/aviso.repository.port';
export type { AvisoRepositoryPort as PanelTecnicoRepositoryPort } from '../../../aviso/domain/port/aviso.repository.port';