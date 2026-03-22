/**
 * Re-exporta las interfaces centralizadas para uso en el módulo home
 * Esto evita duplicación y mantiene consistencia con el backend
 */

// Re-exportar tipos desde interfaces centralizadas
export type {
  // Departamento
  DepartamentoResponse,
  DepartamentoRequest,

  // Tipo Habitación
  TipoHabitacionResponse,

  // Habitación
  HabitacionResponse,
  HabitacionesDisponiblesResponse,
  EstadoHabitacion,

  // Hotel
  HotelResponse,
  HotelInfo,
  HotelDetalleResponse,
  HotelesConDepartamentoResponse,

  // Reserva
  ReservaListResponse,
  ReservaResponse,
  ReservaCreatedResponse,
  ReservaUpdateResponse,
  ReservaRequest,
  ReservaUpdateRequest,
  MisReservasResponse,
  MisReservasVacio,
  HotelSimple,
  UsuarioSimple,
  DetalleSimple,
  EstadoReserva,
} from '../../../interfaces';

// Alias para compatibilidad con código existente
// export type DepartamentoPublic = import('../../interfaces').DepartamentoResponse;
// export type HabitacionPublic = import('../../interfaces').HabitacionResponse;
// export type TipoHabitacionPublic = import('../../interfaces').TipoHabitacionResponse;
// export type HotelPublic = import('../../interfaces').HotelInfo;
// export type ReservaCompleta = import('../../interfaces').ReservaListResponse;
// export type ReservaDetalleResponse = import('../../interfaces').ReservaResponse;

