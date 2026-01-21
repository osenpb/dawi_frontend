import { ReservaResponse } from '../../interfaces';

/**
 * Helpers para acceder a datos de reserva de manera centralizada
 */
export class ConfirmationDataAccessors {

  static get hotelNombre(): (reserva: ReservaResponse | null) => string {
    return (reserva) => reserva?.hotel?.nombre || 'N/A';
  }

  static get hotelDireccion(): (reserva: ReservaResponse | null) => string {
    return (reserva) => reserva?.hotel?.direccion || 'N/A';
  }

  static get clienteNombreCompleto(): (reserva: ReservaResponse | null) => string {
    return (reserva) => {
      const cliente = reserva?.cliente;
      if (!cliente) return 'N/A';
      return `${cliente.nombre} ${cliente.apellido}`.trim() || 'N/A';
    };
  }

  static get clienteDni(): (reserva: ReservaResponse | null) => string {
    return (reserva) => reserva?.cliente?.documento || 'N/A';
  }

  static get clienteEmail(): (reserva: ReservaResponse | null) => string {
    return (reserva) => reserva?.cliente?.email || 'N/A';
  }
}