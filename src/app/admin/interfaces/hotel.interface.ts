import { Departamento } from "./departamento.interface";


export interface Hotel {
  id:           number;
  nombre:       string;
  direccion:    string;
  departamento: Departamento;
  precioMinimo: number;
}

