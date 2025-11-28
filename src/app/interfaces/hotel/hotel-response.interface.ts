
import { DepartamentoResponse } from "../departamento/departamento-response.interface";
import { HabitacionResponse } from "../habitacion/habitacion-response.interface";



export interface HotelResponse {
  id:           number;
  departamento: DepartamentoResponse;
  nombre:       string;
  direccion:    string;
  habitaciones: HabitacionResponse[]

}

