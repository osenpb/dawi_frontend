import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaResponse } from '../../../interfaces/reserva/reserva.interface';

@Component({
  selector: 'app-reservation-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Icono según estado -->
    <div class="text-center mb-8">
      <!-- CONFIRMADA -->
      @if (reserva?.estado === 'CONFIRMADA') {
      <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
        <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h1 class="text-3xl font-serif text-slate-800 mb-2">¡Reserva Confirmada!</h1>
      <p class="text-gray-500">Tu pago ha sido procesado exitosamente</p>
      }

      <!-- PENDIENTE -->
      @if (reserva?.estado === 'PENDIENTE') {
      <div class="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
        <svg class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h1 class="text-3xl font-serif text-slate-800 mb-2">Reserva Pendiente de Pago</h1>
      <p class="text-gray-500">Completa el pago para confirmar tu reserva</p>
      }

      <!-- CANCELADA -->
      @if (reserva?.estado === 'CANCELADA') {
      <div class="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
        <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
      <h1 class="text-3xl font-serif text-slate-800 mb-2">Reserva Cancelada</h1>
      <p class="text-gray-500">Esta reserva ha sido cancelada</p>
      }
    </div>

    <!-- Número de reserva -->
    <div class="rounded-lg p-4 mb-6 text-center" [ngClass]="{
      'bg-green-50 border border-green-200': reserva?.estado === 'CONFIRMADA',
      'bg-yellow-50 border border-yellow-200': reserva?.estado === 'PENDIENTE',
      'bg-red-50 border border-red-200': reserva?.estado === 'CANCELADA'
    }">
      <p class="text-sm mb-1" [ngClass]="{
        'text-green-600': reserva?.estado === 'CONFIRMADA',
        'text-yellow-600': reserva?.estado === 'PENDIENTE',
        'text-red-600': reserva?.estado === 'CANCELADA'
      }">Número de Reserva</p>
      <p class="text-2xl font-bold" [ngClass]="{
        'text-green-700': reserva?.estado === 'CONFIRMADA',
        'text-yellow-700': reserva?.estado === 'PENDIENTE',
        'text-red-700': reserva?.estado === 'CANCELADA'
      }">{{ reserva?.id?.toString()?.padStart(6, '0') }}</p>
    </div>
  `,
})
export class ReservationHeaderComponent {
  @Input() reserva!: ReservaResponse;
}