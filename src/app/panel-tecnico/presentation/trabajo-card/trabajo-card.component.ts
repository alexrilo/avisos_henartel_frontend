import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrabajoCardData } from '../../domain/model/panel-tecnico.model';

@Component({
  selector: 'app-trabajo-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './trabajo-card.component.html'
})
export class TrabajoCardComponent {
  card = input.required<TrabajoCardData>();
  accion = output<{ card: TrabajoCardData; accion: string; observacion?: string }>();

  // Modal state
  showModal = signal(false);
  pendingAccion = signal<string>('');
  observacion = signal('');

  onQuickAction(accion: string) {
    // Show modal for COMPLETAR or CANCELAR actions
    if (accion === 'COMPLETAR' || accion === 'CANCELAR') {
      this.pendingAccion.set(accion);
      this.showModal.set(true);
    } else {
      this.accion.emit({ card: this.card(), accion });
    }
  }

  onConfirmModal() {
    this.accion.emit({
      card: this.card(),
      accion: this.pendingAccion(),
      observacion: this.observacion() || undefined
    });
    this.closeModal();
  }

  closeModal() {
    this.showModal.set(false);
    this.pendingAccion.set('');
    this.observacion.set('');
  }

  getModalTitle(): string {
    return this.pendingAccion() === 'COMPLETAR' ? 'Completar Trabajo' : 'Cancelar Trabajo';
  }

  getPrioridadClass(prioridad: string): string {
    const classes: Record<string, string> = {
      'BAJA': 'border-l-4 border-l-green-500',
      'MEDIA': 'border-l-4 border-l-orange-500',
      'ALTA': 'border-l-4 border-l-red-500',
      'URGENTE': 'border-l-4 border-l-red-700'
    };
    return classes[prioridad] || '';
  }

  getStatusBadgeClass(estado: string): string {
    const classes: Record<string, string> = {
      'NUEVO': 'bg-primary-container text-on-primary-container',
      'ASIGNADO': 'bg-secondary-container text-on-secondary-container',
      'EN_CURSO': 'bg-primary-container text-on-primary-container',
      'PENDIENTE_SEGUIMIENTO': 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
      'COMPLETADO': 'bg-green-100 text-green-800',
      'CANCELADO': 'bg-error-container text-on-error-container'
    };
    return classes[estado] || 'bg-surface-container text-on-surface-variant';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'NUEVO': 'Nuevo',
      'ASIGNADO': 'Asignado',
      'EN_CURSO': 'En Curso',
      'COMPLETADO': 'Completado',
      'CANCELADO': 'Cancelado',
      'PENDIENTE_SEGUIMIENTO': 'Pendiente'
    };
    return labels[estado] || estado;
  }
}