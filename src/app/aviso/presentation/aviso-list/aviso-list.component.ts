import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AvisoService } from '../../application/aviso.service';
import { Aviso } from '../../domain/model/aviso.model';

@Component({
  selector: 'app-aviso-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './aviso-list.component.html'
})
export class AvisoListComponent implements OnInit {
  avisoService = inject(AvisoService);
  search = signal('');

  ngOnInit() {
    this.avisoService.loadAvisos();
  }

  onSearch() {
    this.avisoService.updateSearch(this.search());
  }

  onFilterChange(field: 'estado' | 'prioridad', value: string) {
    this.avisoService.updateFilter(field, value || undefined);
  }

  onPageChange(page: number) {
    this.avisoService.updatePage(page);
  }

  async cancelar(aviso: Aviso) {
    if (confirm(`¿Cancelar aviso "${aviso.numeroCorrelativo}"?`)) {
      await this.avisoService.cancelar(aviso.id);
    }
  }

  getPrioridadClass(prioridad: string): string {
    const classes: Record<string, string> = {
      'BAJA': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-container text-on-success-container',
      'MEDIA': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed-variant',
      'ALTA': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-error-container text-on-error-container',
      'URGENTE': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-error text-white'
    };
    return classes[prioridad] || '';
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