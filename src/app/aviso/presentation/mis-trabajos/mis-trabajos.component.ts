import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AvisoService } from '../../application/aviso.service';
import { AuthService } from '../../../auth/application/auth.service';
import { Aviso } from '../../domain/model/aviso.model';

@Component({
  selector: 'app-mis-trabajos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-trabajos.component.html'
})
export class MisTrabajosComponent implements OnInit {
  private avisoService = inject(AvisoService);
  private authService = inject(AuthService);
  trabajos = signal<Aviso[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadTrabajos();
  }

  private async loadTrabajos() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const user = this.authService.user();
      if (!user?.userId) {
        this.error.set('No se pudo identificar al técnico');
        return;
      }
      const data = await this.avisoService.getMisTrabajos(user.userId);
      this.trabajos.set(data);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al cargar mis trabajos');
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

  getPrioridadClass(prioridad: string): string {
    const classes: Record<string, string> = {
      'BAJA': 'prioridad-baja',
      'MEDIA': 'prioridad-media',
      'ALTA': 'prioridad-alta',
      'URGENTE': 'prioridad-urgente'
    };
    return classes[prioridad] || '';
  }
}