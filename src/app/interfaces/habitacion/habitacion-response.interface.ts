
import { TipoHabitacionResponse } from "../tipo-habitacion/tipo-habitacion-response.interface";

export interface HabitacionResponse {
  id?: number;
  numero: string;
  estado: "DISPONIBLE" | "OCUPADA" | "MANTENIMIENTO";
  precio: number;
  tipoHabitacion: TipoHabitacionResponse;
  hotelId: number;
}
