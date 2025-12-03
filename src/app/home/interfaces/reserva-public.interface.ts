export interface ClienteRequest {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
}

export interface ReservaRequest {
  fechaInicio: string;
  fechaFin: string;
  habitacionesIds: number[];
  cliente: ClienteRequest;
}

export interface ReservaResponse {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  total: number;
  estado: string;
  habitaciones: string[];
}

export interface ReservaDetalleResponse {
  id: number;
  fechaReserva: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  total: number;
  montoTotal?: number;
  // Campos aplanados para fácil acceso
  hotelNombre?: string;
  hotelDireccion?: string;
  clienteNombre?: string;
  clienteDni?: string;
  clienteEmail?: string;
  habitaciones?: {
    id: number;
    numero: string;
    tipo: string;
    precio: number;
  }[];
  // Estructura anidada original
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    documento: string;
  };
  hotel: {
    id: number;
    nombre: string;
    direccion: string;
    departamento: {
      id: number;
      nombre: string;
      detalle?: string;
    };
    habitaciones: any[];
    imagenUrl: string | null;
  };
  detalles: {
    id: number;
    habitacionId: number;
    precioNoche: number;
  }[];
}

// MisReservasResponse es un array de ReservaResponse directamente
export type MisReservasResponse = ReservaCompleta[] | MisReservasVacio;

export interface MisReservasVacio {
  mensaje: string;
  reservas: [];
}

export interface ReservaCompleta {
  id: number;
  fechaReserva: string;
  fechaInicio: string;
  fechaFin: string;
  total: number;
  estado: string;
  hotel: {
    id: number;
    nombre: string;
    direccion: string;
    departamento: {
      id: number;
      nombre: string;
    };
    habitaciones: any[];
    imagenUrl: string | null;
  };
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    documento: string;
  };
  detalles: {
    id: number;
    habitacionId: number;
    precioNoche: number;
  }[];
}
