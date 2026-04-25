import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AvisoService } from '../../application/aviso.service';
import { Aviso } from '../../domain/model/aviso.model';

@Component({
  selector: 'app-reprogramar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reprogramar.component.html'
})
export class ReprogramarComponent implements OnInit {
  private avisoService = inject(AvisoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  avisoId: number | null = null;
  aviso = signal<Aviso | null>(null);
  nuevaFecha = signal('');
  nuevoTecnicoId = signal<number | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);

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
      if (data.fechaProgramada) {
        this.nuevaFecha.set(data.fechaProgramada.substring(0, 16));
      }
    } catch {
      this.error.set('Error al cargar aviso');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (!this.nuevaFecha()) {
      this.error.set('La fecha es obligatoria');
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.avisoService.reprogramar(this.avisoId!, {
        nuevaFecha: this.nuevaFecha(),
        nuevoTecnicoId: this.nuevoTecnicoId() || undefined
      });
      this.router.navigate(['/dashboard/avisos']);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al reprogramar');
    } finally {
      this.loading.set(false);
    }
  }
}