import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TechnicianWorkload } from '../../domain/model/dashboard.model';

@Component({
  selector: 'app-technician-workload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-primary-container/30 rounded-2xl p-5">
      <h2 class="text-lg font-bold text-primary mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined">engineering</span>
        Carga por Técnico
      </h2>
      <table class="w-full text-left mb-4">
        <thead>
          <tr class="bg-primary-container/50">
            <th class="px-4 py-2 text-xs uppercase tracking-wider text-on-primary-container font-bold font-label">Técnico</th>
            <th class="px-4 py-2 text-xs uppercase tracking-wider text-on-primary-container font-bold font-label">Trabajos Activos</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary-container/30">
          @for (tech of workload(); track tech.tecnicoId) {
            <tr class="hover:bg-primary-container/20">
              <td class="px-4 py-3 text-on-surface font-medium">{{ tech.nombre }}</td>
              <td class="px-4 py-3 text-on-surface">{{ tech.activeJobsCount }}</td>
            </tr>
          }
        </tbody>
      </table>
      
      <!-- CSS Bar Chart -->
      <div class="flex flex-col gap-3">
        @for (tech of workload(); track tech.tecnicoId) {
          <div class="flex items-center gap-3">
            <span class="w-24 text-sm text-on-surface-variant truncate font-medium" title="{{ tech.nombre }}">{{ tech.nombre }}</span>
            <div class="flex-1 bg-surface-container-low h-4 rounded-full overflow-hidden">
              <div class="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all duration-300" [style.width.%]="(tech.activeJobsCount / maxCount()) * 100"></div>
            </div>
            <span class="w-8 text-right font-bold text-on-surface">{{ tech.activeJobsCount }}</span>
          </div>
        }
      </div>
    </div>
  `
})
export class TechnicianWorkloadComponent {
  workload = input.required<TechnicianWorkload[]>();
  chartData = input<[string, number][]>();
  
  maxCount = () => Math.max(...this.workload().map(t => t.activeJobsCount), 1);
}