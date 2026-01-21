import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaResponse } from '../../../interfaces/reserva/reserva.interface';
import { ConfirmationUtils } from '../../utils/confirmation-utils';
import { ConfirmationDataAccessors } from '../../utils/confirmation-data-accessors';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Detalles de la reserva -->
    <div class="bg-white border border-gray-200 rounded-lg mb-6" id="comprobante">

      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h2 class="text-lg font-medium text-gray-800">Detalles de la Reserva</h2>
      </div>

      <div class="p-6 space-y-6">

        <!-- Hotel -->
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Hotel</p>
            <p class="text-lg font-semibold text-gray-800">{{ hotelNombre }}</p>
            <p class="text-sm text-gray-500">{{ hotelDireccion }}</p>
          </div>
        </div>

        <hr class="border-gray-200">

        <!-- Fechas -->
        <div class="grid grid-cols-2 gap-6">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">Check-in</p>
              <p class="font-semibold text-gray-800">{{ reserva.fechaInicio }}</p>
              <p class="text-xs text-gray-400">Desde las 14:00 hrs</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-500">Check-out</p>
              <p class="font-semibold text-gray-800">{{ reserva.fechaFin }}</p>
              <p class="text-xs text-gray-400">Hasta las 12:00 hrs</p>
            </div>
          </div>
        </div>

        <hr class="border-gray-200">

        <!-- Huésped -->
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Huésped Principal</p>
            <p class="text-lg font-semibold text-gray-800">{{ clienteNombreCompleto }}</p>
            <p class="text-sm text-gray-500">DNI: {{ clienteDni }}</p>
            <p class="text-sm text-gray-500">{{ clienteEmail }}</p>
          </div>
        </div>

        <hr class="border-gray-200">

        <!-- Habitaciones -->
        <div>
          <p class="text-sm text-gray-500 mb-3">Habitaciones Reservadas ({{ calcularNoches() }} noches)</p>
          <div class="space-y-2">
            @for (detalle of reserva.detalles; track detalle.id) {
              @let habInfo = getHabitacionInfo(detalle.habitacionId);
              <div class="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
                    <span class="text-sm font-medium text-indigo-600">{{ habInfo.numero }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">Habitación {{ habInfo.numero }}</p>
                    <p class="text-sm text-gray-500">{{ habInfo.tipo }}</p>
                  </div>
                </div>
                <p class="font-semibold text-gray-800">{{ formatCurrency(detalle.precioNoche) }}/noche</p>
              </div>
            }
          </div>
        </div>

        <hr class="border-gray-200">

        <!-- Total -->
        <div class="rounded-lg p-4 text-white" [ngClass]="{
          'bg-linear-to-r from-green-600 to-green-700': reserva.estado === 'CONFIRMADA',
          'bg-linear-to-r from-yellow-500 to-yellow-600': reserva.estado === 'PENDIENTE',
          'bg-linear-to-r from-gray-500 to-gray-600': reserva.estado === 'CANCELADA'
        }">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm opacity-80">
                @if (reserva.estado === 'CONFIRMADA') { Total Pagado }
                @else if (reserva.estado === 'PENDIENTE') { Total a Pagar }
                @else { Total }
              </p>
              <p class="text-xs opacity-80">Incluye todos los impuestos</p>
            </div>
            <p class="text-3xl font-bold">{{ formatCurrency(reserva.total || 0) }}</p>
          </div>
        </div>

        <!-- Estado badge -->
        <div class="flex items-center justify-center gap-2">
          <span class="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full" [ngClass]="{
            'bg-green-100 text-green-700': reserva.estado === 'CONFIRMADA',
            'bg-yellow-100 text-yellow-700': reserva.estado === 'PENDIENTE',
            'bg-red-100 text-red-700': reserva.estado === 'CANCELADA'
          }">
            @if (reserva.estado === 'CONFIRMADA') {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Pago Confirmado
            }
            @if (reserva.estado === 'PENDIENTE') {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Pendiente de Pago
            }
            @if (reserva.estado === 'CANCELADA') {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Reserva Cancelada
            }
          </span>
        </div>

      </div>
    </div>
  `,
})
export class ReservationDetailsComponent {
  @Input() reserva!: ReservaResponse;

  // Accessors
  get hotelNombre(): string {
    return ConfirmationDataAccessors.hotelNombre(this.reserva);
  }

  get hotelDireccion(): string {
    return ConfirmationDataAccessors.hotelDireccion(this.reserva);
  }

  get clienteNombreCompleto(): string {
    return ConfirmationDataAccessors.clienteNombreCompleto(this.reserva);
  }

  get clienteDni(): string {
    return ConfirmationDataAccessors.clienteDni(this.reserva);
  }

  get clienteEmail(): string {
    return ConfirmationDataAccessors.clienteEmail(this.reserva);
  }

  // Utilities
  formatCurrency(amount: number): string {
    return ConfirmationUtils.formatCurrency(amount);
  }

  calcularNoches(): number {
    return ConfirmationUtils.calcularNoches(this.reserva!);
  }

  getHabitacionInfo(habitacionId: number) {
    return ConfirmationUtils.getHabitacionInfo(habitacionId, this.reserva?.hotel!);
  }
}
