import { InjectionToken } from '@angular/core';
import { Aviso, CreateAvisoRequest, UpdateAvisoRequest, AssignTecnicoRequest, ChangeEstadoRequest, ReprogramarRequest, AvisoFilters, PaginatedResponse } from '../model/aviso.model';

export interface AvisoRepositoryPort {
  getAvisos(filters: AvisoFilters): Promise<PaginatedResponse<Aviso>>;
  getAviso(id: number, tecnicoId?: number): Promise<Aviso>;
  createAviso(aviso: CreateAvisoRequest): Promise<Aviso>;
  updateAviso(id: number, aviso: UpdateAvisoRequest): Promise<Aviso>;
  assignTecnico(id: number, request: AssignTecnicoRequest): Promise<Aviso>;
  changeEstado(id: number, request: ChangeEstadoRequest): Promise<Aviso>;
  reprogramar(id: number, request: ReprogramarRequest): Promise<Aviso>;
  cancelar(id: number): Promise<Aviso>;
  getMisTrabajos(tecnicoId: number): Promise<Aviso[]>;
}

export const AVISO_REPOSITORY_TOKEN = new InjectionToken<AvisoRepositoryPort>('AvisoRepositoryPort');
