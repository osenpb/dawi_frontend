
import { Departamento } from "../departamento/departamento.interface";
import { HabitacionResponse } from "../habitacion/habitacion-response.interface";



export interface HotelResponse {
  id:           number;
  departamento: Departamento;
  nombre:       string;
  direccion:    string;
  habitaciones: HabitacionResponse[]

}

