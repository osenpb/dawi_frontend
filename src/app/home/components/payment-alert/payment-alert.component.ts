import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-alert',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (reserva?.estado === 'PENDIENTE') {
    <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <p class="font-medium text-yellow-800">Pago pendiente</p>
          <p class="text-sm text-yellow-700">Tu reserva no está confirmada hasta que completes el pago.</p>
        </div>
      </div>
      <div class="mt-4">
        <a [routerLink]="['/home/reserva', reserva?.id, 'pago']"
          class="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
          Completar Pago
        </a>
      </div>
    </div>
    }
  `,
})
export class PaymentAlertComponent {
  @Input() reserva!: any;
}
