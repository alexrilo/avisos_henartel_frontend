import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AvisoRepositoryPort, AVISO_REPOSITORY_TOKEN } from '../domain/port/aviso.repository.port';
import { Aviso, CreateAvisoRequest, UpdateAvisoRequest, AssignTecnicoRequest, ChangeEstadoRequest, ReprogramarRequest, AvisoFilters, PaginatedResponse } from '../domain/model/aviso.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AvisoApiRepository implements AvisoRepositoryPort {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/avisos`;

  async getAvisos(filters: AvisoFilters): Promise<PaginatedResponse<Aviso>> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.prioridad) params = params.set('prioridad', filters.prioridad);
    if (filters.clienteId) params = params.set('clienteId', filters.clienteId.toString());
    params = params.set('page', filters.page.toString());
    params = params.set('size', filters.size.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortDir) params = params.set('sortDir', filters.sortDir);

    const response = await firstValueFrom(
      this.http.get<PaginatedResponse<Aviso>>(this.API_URL, { params })
    );
    return response;
  }

  async getAviso(id: number, tecnicoId?: number): Promise<Aviso> {
    let params = new HttpParams();
    if (tecnicoId) params = params.set('tecnicoId', tecnicoId.toString());
    return firstValueFrom(this.http.get<Aviso>(`${this.API_URL}/${id}`, { params }));
  }

  async createAviso(aviso: CreateAvisoRequest): Promise<Aviso> {
    return firstValueFrom(this.http.post<Aviso>(this.API_URL, aviso));
  }

  async updateAviso(id: number, aviso: UpdateAvisoRequest): Promise<Aviso> {
    return firstValueFrom(this.http.put<Aviso>(`${this.API_URL}/${id}`, aviso));
  }

  async assignTecnico(id: number, request: AssignTecnicoRequest): Promise<Aviso> {
    return firstValueFrom(this.http.post<Aviso>(`${this.API_URL}/${id}/asignar`, request));
  }

  async changeEstado(id: number, request: ChangeEstadoRequest): Promise<Aviso> {
    return firstValueFrom(this.http.post<Aviso>(`${this.API_URL}/${id}/cambiar-estado`, request));
  }

  async reprogramar(id: number, request: ReprogramarRequest): Promise<Aviso> {
    return firstValueFrom(this.http.post<Aviso>(`${this.API_URL}/${id}/reprogramar`, request));
  }

  async cancelar(id: number): Promise<Aviso> {
    return firstValueFrom(this.http.post<Aviso>(`${this.API_URL}/${id}/cancelar`, {}));
  }

  async getMisTrabajos(tecnicoId: number): Promise<Aviso[]> {
    return firstValueFrom(this.http.get<Aviso[]>(`${this.API_URL}/mis-trabajos`, {
      params: { tecnicoId: tecnicoId.toString() }
    }));
  }
}
