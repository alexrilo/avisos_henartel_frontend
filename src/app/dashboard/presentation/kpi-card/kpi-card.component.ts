import { Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="bg-surface-container-lowest rounded-2xl p-6 text-center shadow-sm ring-1 ring-outline-variant/10" [style.border-top-color]="color()">
      <span class="block text-4xl font-extrabold text-on-surface font-headline">{{ value() }}</span>
      <span class="text-xs uppercase tracking-wider text-on-surface-variant mt-2 block font-label">{{ label() }}</span>
    </div>
  `
})
export class KpiCardComponent {
  label = input.required<string>();
  value = input.required<number>();
  color = input<string>('#ccc');
}