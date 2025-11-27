import { HabitacionResponse } from "../habitacion/habitacion-response.interface";


export interface DetalleReserva {
  id?: number;
  precioNoche: number;
  habitacion: HabitacionResponse;
}
