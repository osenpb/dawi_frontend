
import { Cliente } from '../cliente/cliente.interface';

import { DetalleReserva } from '../../interfaces/reserva/detalleReserva.interface';
import { HotelResponse } from '../hotel/hotel-response.interface';

export interface Reserva {
  id: number;
  fechaReserva: string;
  fechaInicio: string;
  fechaFin: string;
  total: number;
  estado: 'CONFIRMADA' | 'CANCELADA';
  cliente: Cliente;
  hotel: HotelResponse;
  detalles: DetalleReserva[];
}

export interface ReservaAdminUpdateDTO {
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  hotelId: number;
  cliente: {
    dni: string;
    nombre: string;
    apellido: string;
    correo: string;
  };
  habitaciones: number[];
}
