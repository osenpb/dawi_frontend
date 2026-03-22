import { ReservaResponse } from '../../../interfaces';

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
      const nombre = reserva?.usuarioNombre;
      const apellido = reserva?.usuarioApellido;
      if (!nombre && !apellido) return 'N/A';
      return `${nombre} ${apellido}`.trim() || 'N/A';
    };
  }

  static get clienteDni(): (reserva: ReservaResponse | null) => string {
    return (reserva) => reserva?.usuarioDni || 'N/A';
  }

  static get clienteEmail(): (reserva: ReservaResponse | null) => string {
    return (reserva) => reserva?.usuarioEmail || 'N/A';
  }
}
