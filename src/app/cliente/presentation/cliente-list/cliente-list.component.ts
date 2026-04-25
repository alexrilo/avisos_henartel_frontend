import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../application/cliente.service';
import { Cliente } from '../../domain/model/cliente.model';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cliente-list.component.html'
})
export class ClienteListComponent implements OnInit {
  clienteService = inject(ClienteService);
  search = signal('');

  ngOnInit() {
    this.clienteService.loadClientes();
  }

  onSearch() {
    this.clienteService.updateSearch(this.search());
  }

  onFilterChange(field: 'estado' | 'tipo', value: string) {
    this.clienteService.loadClientes({ [field]: value || undefined, page: 0 });
  }

  onPageChange(page: number) {
    this.clienteService.updatePage(page);
  }

  async toggleStatus(cliente: Cliente) {
    if (confirm(`¿${cliente.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'} cliente "${cliente.nombreOrazonSocial}"?`)) {
      await this.clienteService.toggleClienteStatus(cliente.id);
    }
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'PARTICULAR' ? 'Particular' : 'Empresa';
  }
}
