import { Hotel } from "./hotel.interface";
import { TipoHabitacion } from "./tipoHabitacion.interface";

export interface Habitacion {
  id?: number;
  numero: string;
  estado: "DISPONIBLE" | "OCUPADA" | "MANTENIMIENTO";
  precio: number;
  tipoHabitacion: TipoHabitacion;
  hotelId: number;
}
