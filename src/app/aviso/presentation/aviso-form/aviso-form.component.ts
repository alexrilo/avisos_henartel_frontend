import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AvisoService } from '../../application/aviso.service';
import { ClienteService } from '../../../cliente/application/cliente.service';
import { Aviso, UpdateAvisoRequest } from '../../domain/model/aviso.model';

@Component({
  selector: 'app-aviso-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './aviso-form.component.html'
})
export class AvisoFormComponent implements OnInit {
  private avisoService = inject(AvisoService);
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = false;
  avisoId: number | null = null;

  clientes = this.clienteService.clientes;
  clienteId = signal<number | null>(null);
  descripcion = signal('');
  prioridad = signal<'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'>('MEDIA');
  calle = signal('');
  numero = signal('');
  localidad = signal('');
  provincia = signal('');
  codigoPostal = signal('');
  fechaProgramada = signal<string | null>(null);
  
  error = signal<string | null>(null);
  loading = signal(false);

  async ngOnInit() {
    // Cargar lista de clientes para el dropdown
    await this.clienteService.loadClientes({ page: 0, size: 1000 });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.avisoId = +id;
      this.loadAviso();
    }
  }

  private async loadAviso() {
    if (!this.avisoId) return;
    this.loading.set(true);
    try {
      const aviso: Aviso = await this.avisoService.getAviso(this.avisoId);
      this.clienteId.set(aviso.clienteId);
      this.descripcion.set(aviso.descripcion);
      this.prioridad.set(aviso.prioridad);
      this.calle.set(aviso.direccion.calle);
      this.numero.set(aviso.direccion.numero);
      this.localidad.set(aviso.direccion.localidad);
      this.provincia.set(aviso.direccion.provincia);
      this.codigoPostal.set(aviso.direccion.codigoPostal);
      this.fechaProgramada.set(aviso.fechaProgramada);
    } catch {
      this.error.set('Error al cargar aviso');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    this.error.set(null);
    this.loading.set(true);
    try {
      if (!this.clienteId()) {
        this.error.set('El cliente es obligatorio');
        return;
      }

      if (this.isEdit && this.avisoId) {
        const updateData: UpdateAvisoRequest = {
          descripcion: this.descripcion(),
          prioridad: this.prioridad(),
          calle: this.calle(),
          numero: this.numero(),
          localidad: this.localidad(),
          provincia: this.provincia(),
          codigoPostal: this.codigoPostal(),
          fechaProgramada: this.fechaProgramada() || undefined
        };
        await this.avisoService.updateAviso(this.avisoId, updateData);
      } else {
        await this.avisoService.createAviso({
          clienteId: this.clienteId()!,
          descripcion: this.descripcion(),
          prioridad: this.prioridad(),
          calle: this.calle(),
          numero: this.numero(),
          localidad: this.localidad(),
          provincia: this.provincia(),
          codigoPostal: this.codigoPostal(),
          fechaProgramada: this.fechaProgramada() || undefined
        });
      }

      this.router.navigate(['/dashboard/avisos']);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al guardar aviso');
    } finally {
      this.loading.set(false);
    }
  }

  getFormTitle(): string {
    return this.isEdit ? 'Editar Aviso' : 'Nuevo Aviso';
  }
}