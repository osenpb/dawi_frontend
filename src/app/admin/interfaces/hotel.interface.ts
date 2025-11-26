import { Departamento } from "./departamento.interface";
import { Habitacion } from "./habitacion.interface";


export interface Hotel {
  id:           number;
  departamento: Departamento;
  nombre:       string;
  direccion:    string;
  habitaciones: Habitacion[]

}

