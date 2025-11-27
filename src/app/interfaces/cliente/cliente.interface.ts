export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  email: string;
}

export interface ClienteDTO {
  dni: string;
  nombre: string;
  apellido: string;
  correo: string;
}
