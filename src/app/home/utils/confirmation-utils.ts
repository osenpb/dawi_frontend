import { ReservaResponse } from '../../interfaces';

/**
 * Utilidades para formateo y cálculos relacionados con confirmaciones de reserva
 */
export class ConfirmationUtils {

  /**
   * Formatea una fecha en formato largo en español peruano
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Formatea un monto como moneda peruana (PEN)
   */
  static formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  /**
   * Calcula el número de noches entre fechaInicio y fechaFin
   */
  static calcularNoches(reserva: ReservaResponse): number {
    if (!reserva) return 0;

    const inicio = new Date(reserva.fechaInicio);
    const fin = new Date(reserva.fechaFin);
    const diff = fin.getTime() - inicio.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene información de una habitación por su ID
   */
  static getHabitacionInfo(habitacionId: number, hotel: ReservaResponse['hotel']): { numero: string; tipo: string; precio: number } {
    if (!hotel?.habitaciones) {
      return { numero: habitacionId.toString(), tipo: 'Standard', precio: 0 };
    }

    const habitacion = hotel.habitaciones.find((h: any) => h.id === habitacionId);
    if (!habitacion) {
      return { numero: habitacionId.toString(), tipo: 'Standard', precio: 0 };
    }

    return {
      numero: habitacion.numero,
      tipo: habitacion.tipoHabitacion?.nombre || 'Standard',
      precio: habitacion.precio
    };
  }

  /**
   * Calcula el subtotal por noche sumando todos los precios de noche de los detalles
   */
  static calcularSubtotalPorNoche(reserva: ReservaResponse): number {
    if (!reserva?.detalles) return 0;
    return reserva.detalles.reduce((sum: number, detalle: any) => sum + detalle.precioNoche, 0);
  }
}