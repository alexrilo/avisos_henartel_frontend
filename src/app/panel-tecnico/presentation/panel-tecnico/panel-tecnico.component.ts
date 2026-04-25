import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PanelTecnicoService } from '../../application/panel-tecnico.service';
import { TrabajoCardComponent } from '../trabajo-card/trabajo-card.component';
import { TrabajoCardData } from '../../domain/model/panel-tecnico.model';

@Component({
  selector: 'app-panel-tecnico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TrabajoCardComponent],
  templateUrl: './panel-tecnico.component.html'
})
export class PanelTecnicoComponent implements OnInit {
  panelService = inject(PanelTecnicoService);
  search = signal('');

  ngOnInit() {
    this.panelService.loadTrabajos();
  }

  onSearch() {
    this.panelService.updateFilter({ search: this.search() });
  }

  onFilterChange(estado: string) {
    this.panelService.updateFilter({ estado: estado || undefined });
  }

  async onEstadoChange(card: TrabajoCardData, accion: string, observacion?: string) {
    const estadoMap: Record<string, string> = {
      'INICIAR': 'EN_CURSO',
      'COMPLETAR': 'COMPLETADO',
      'PENDIENTE': 'PENDIENTE_SEGUIMIENTO',
      'REINICIAR': 'ASIGNADO',
      'CANCELAR': 'CANCELADO'
    };
    const nuevoEstado = estadoMap[accion];
    if (nuevoEstado) {
      await this.panelService.cambiarEstado(card.id, nuevoEstado, undefined, observacion);
    }
  }
}