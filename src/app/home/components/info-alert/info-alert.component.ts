import { Component, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (estado() !== 'CANCELADA') {
    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div class="flex gap-3">
        <svg class="w-6 h-6 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="text-sm text-amber-800">
          <p class="font-medium mb-1">Información importante:</p>
          <ul class="list-disc list-inside space-y-1 text-amber-700">
            <li>Presente este comprobante al momento del check-in</li>
            <li>Se requiere documento de identidad original</li>
            <li>El check-in es a partir de las 14:00 hrs</li>
            <li>Para cancelaciones, comuníquese con 24 hrs de anticipación</li>
          </ul>
        </div>
      </div>
    </div>
    }
  `,
})
export class InfoAlertComponent {
  readonly estado = input.required<string>();
}
