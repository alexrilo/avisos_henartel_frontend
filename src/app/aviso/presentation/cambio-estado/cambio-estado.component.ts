import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AvisoService } from '../../application/aviso.service';
import { Aviso } from '../../domain/model/aviso.model';

@Component({
  selector: 'app-cambio-estado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cambio-estado.component.html'
})
export class CambioEstadoComponent implements OnInit {
  private avisoService = inject(AvisoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  avisoId: number | null = null;
  aviso = signal<Aviso | null>(null);
  nuevoEstado = signal('');
  tecnicoId = signal<number | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);

  estadosDisponibles = signal<string[]>([]);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.avisoId = +idParam;
      this.loadAviso();
    }
  }

  private async loadAviso() {
    if (!this.avisoId) return;
    this.loading.set(true);
    try {
      const data: Aviso = await this.avisoService.getAviso(this.avisoId);
      this.aviso.set(data);
      this.calcularEstadosDisponibles(data.estado);
    } catch {
      this.error.set('Error al cargar aviso');
    } finally {
      this.loading.set(false);
    }
  }

  private calcularEstadosDisponibles(estadoActual: string) {
    const estados: Record<string, string[]> = {
      'NUEVO': ['ASIGNADO', 'CANCELADO'],
      'ASIGNADO': ['EN_CURSO', 'CANCELADO'],
      'EN_CURSO': ['COMPLETADO', 'CANCELADO', 'PENDIENTE_SEGUIMIENTO'],
      'PENDIENTE_SEGUIMIENTO': ['ASIGNADO', 'CANCELADO'],
      'COMPLETADO': [],
      'CANCELADO': []
    };
    this.estadosDisponibles.set(estados[estadoActual] || []);
  }

  async onSubmit() {
    if (!this.nuevoEstado()) {
      this.error.set('El estado es obligatorio');
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.avisoService.changeEstado(this.avisoId!, {
        estado: this.nuevoEstado(),
        tecnicoId: this.tecnicoId() || undefined
      });
      this.router.navigate(['/dashboard/avisos']);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al cambiar estado');
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
}