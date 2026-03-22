import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfirmationUtils } from '../../utils/confirmation-utils';
import { ConfirmationDataAccessors } from '../../utils/confirmation-data-accessors';
import { ReservaResponse } from '../../interfaces';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-details.component.html',
})
export class ReservationDetailsComponent {
  reserva = input.required<ReservaResponse>();

  get hotelNombre(): string {
    return ConfirmationDataAccessors.hotelNombre(this.reserva());
  }

  get hotelDireccion(): string {
    return ConfirmationDataAccessors.hotelDireccion(this.reserva());
  }

  get clienteNombreCompleto(): string {
    return ConfirmationDataAccessors.clienteNombreCompleto(this.reserva());
  }

  get clienteDni(): string {
    return ConfirmationDataAccessors.clienteDni(this.reserva());
  }

  get clienteEmail(): string {
    return ConfirmationDataAccessors.clienteEmail(this.reserva());
  }

  formatCurrency(amount: number): string {
    return ConfirmationUtils.formatCurrency(amount);
  }

  calcularNoches(): number {
    return ConfirmationUtils.calcularNoches(this.reserva()!);
  }

  getHabitacionInfo(habitacionId: number) {
    return ConfirmationUtils.getHabitacionInfo(habitacionId, this.reserva()?.hotel!);
  }
}
