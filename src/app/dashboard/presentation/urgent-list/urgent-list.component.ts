import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgentAvisoSummary } from '../../domain/model/dashboard.model';

@Component({
  selector: 'app-urgent-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-error-container rounded-2xl p-5">
      <h2 class="text-lg font-bold text-on-error-container mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined">warning</span>
        Urgentes
      </h2>
      @if (items().length === 0) {
        <p class="text-on-surface-variant text-center italic py-4">No hay avisos urgentes pendientes.</p>
      } @else {
        <ul class="space-y-0">
          @for (item of items(); track item.id) {
            <li class="flex justify-between items-center py-3 border-b border-error-container/30 last:border-b-0">
              <div class="flex flex-col gap-1">
                <strong class="text-on-error-container font-medium">{{ item.numeroCorrelativo }}</strong>
                <span class="text-sm text-on-surface-variant">{{ item.descripcion }}</span>
              </div>
              <span class="bg-on-error-container text-error-container px-3 py-1 rounded-full text-xs font-bold">
                {{ item.estado }}
              </span>
            </li>
          }
        </ul>
      }
    </div>
  `
})
export class UrgentListComponent {
  items = input.required<UrgentAvisoSummary[]>();
}