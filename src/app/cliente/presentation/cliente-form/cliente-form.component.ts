import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClienteService } from '../../application/cliente.service';
import { Cliente, CreateClienteRequest, UpdateClienteRequest } from '../../domain/model/cliente.model';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cliente-form.component.html'
})
export class ClienteFormComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = false;
  clienteId: number | null = null;
  originalTipo: 'PARTICULAR' | 'EMPRESA' = 'PARTICULAR';

  // Form properties - using simple properties for ngModel binding in Angular 18
  tipo: 'PARTICULAR' | 'EMPRESA' = 'PARTICULAR';
  nombreOrazonSocial = '';
  telefono = '';
  personaContacto = '';
  observaciones = '';
  
  error = signal<string | null>(null);
  loading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.clienteId = +id;
      this.loadCliente();
    }
  }

  private async loadCliente() {
    if (!this.clienteId) return;
    this.loading.set(true);
    try {
      const cliente: Cliente = await this.clienteService.getCliente(this.clienteId);
      this.originalTipo = cliente.tipo;
      this.tipo = cliente.tipo;
      this.nombreOrazonSocial = cliente.nombreOrazonSocial;
      this.telefono = cliente.telefono;
      this.personaContacto = cliente.personaContacto || '';
      this.observaciones = cliente.observaciones || '';
    } catch {
      this.error.set('Error al cargar cliente');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    this.error.set(null);
    this.loading.set(true);
    try {
      if (this.isEdit && this.clienteId) {
        // UpdateClienteRequest doesn't include 'tipo' (immutable once created)
        const updateData: UpdateClienteRequest = {
          nombreOrazonSocial: this.nombreOrazonSocial,
          telefono: this.telefono,
          personaContacto: this.personaContacto || undefined,
          observaciones: this.observaciones || undefined
        };
        await this.clienteService.updateCliente(this.clienteId, updateData);
      } else {
        const createData: CreateClienteRequest = {
          tipo: this.tipo,
          nombreOrazonSocial: this.nombreOrazonSocial,
          telefono: this.telefono,
          personaContacto: this.personaContacto || undefined,
          observaciones: this.observaciones || undefined
        };
        await this.clienteService.createCliente(createData);
      }

      this.router.navigate(['/dashboard/clientes']);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Error al guardar cliente');
    } finally {
      this.loading.set(false);
    }
  }

  getFormTitle(): string {
    return this.isEdit ? 'Editar Cliente' : 'Nuevo Cliente';
  }
}
