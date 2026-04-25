import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PanelTecnicoService } from '../../application/panel-tecnico.service';
import { TrabajoDetailData } from '../../domain/model/panel-tecnico.model';

@Component({
  selector: 'app-trabajo-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trabajo-detail.component.html'
})
export class TrabajoDetailComponent implements OnInit {
  private panelService = inject(PanelTecnicoService);
  private route = inject(ActivatedRoute);

  trabajo = signal<TrabajoDetailData | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadDetail();
  }

  private async loadDetail() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const id = +this.route.snapshot.paramMap.get('id')!;
      const data = await this.panelService.getTrabajoDetail(id);
      this.trabajo.set(data);
    } catch {
      this.error.set('Error al cargar detalle del trabajo');
    } finally {
      this.loading.set(false);
    }
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'NUEVO': 'Nuevo',
      'ASIGNADO': 'Asignado',
      'EN_CURSO': 'En Curso',
      'COMPLETADO': 'Completado',
      'CANCELADO': 'Cancelado',
      'PENDIENTE_SEGUIMIENTO': 'Pendiente Seguimiento'
    };
    return labels[estado] || estado;
  }

  getPrioridadLabel(prioridad: string): string {
    const labels: Record<string, string> = {
      'BAJA': 'Baja',
      'MEDIA': 'Media',
      'ALTA': 'Alta',
      'URGENTE': 'Urgente'
    };
    return labels[prioridad] || prioridad;
  }
}