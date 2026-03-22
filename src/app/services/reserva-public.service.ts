import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {
  DepartamentoResponse,
  HotelesConDepartamentoResponse,
  HotelDetalleResponse,
  HotelResponse,
  HabitacionesDisponiblesResponse,
  ReservaRequest,
  ReservaCreatedResponse,
  ReservaResponse,
  ReservaListResponse,
  MisReservasResponse,
} from '../interfaces';
import { LoggerService } from '../core/services/logger.service';
import { environment } from '../../environments/environments';


const baseUrl = `${environment.apiUrl}/public`;

@Injectable({
  providedIn: 'root',
})
export class ReservaPublicService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  // ==================== DEPARTAMENTOS ====================

  getDepartamentos(nombre?: string): Observable<DepartamentoResponse[]> {
    const url = nombre
      ? `${baseUrl}/departamentos?nombre=${encodeURIComponent(nombre)}`
      : `${baseUrl}/departamentos`;

    return this.http.get<DepartamentoResponse[]>(url).pipe(
      catchError((error: any) => {
        this.logger.error('Error al obtener departamentos:', error);
        return throwError(() => error);
      })
    );
  }

  getDepartamentosList(): Observable<DepartamentoResponse[]> {
    return this.http.get<DepartamentoResponse[]>(`${baseUrl}/departamentos`).pipe(
      catchError((error: any) => {
        this.logger.error('Error al obtener departamentos:', error);
        return throwError(() => error);
      })
    );
  }

  getDepartamentoById(id: number): Observable<DepartamentoResponse> {
    return this.http.get<DepartamentoResponse>(`${baseUrl}/departamentos/${id}`).pipe(
      catchError((error: any) => {
        this.logger.error('Error al obtener departamento:', error);
        return throwError(() => error);
      })
    );
  }

  // ==================== HOTELES ====================

  getHotelesPorDepartamento(departamentoId: number): Observable<HotelesConDepartamentoResponse> {
    return this.http
      .get<HotelesConDepartamentoResponse>(`${baseUrl}/hoteles?departamentoId=${departamentoId}`)
      .pipe(
        catchError((error: any) => {
          this.logger.error('Error al obtener hoteles:', error);
          return throwError(() => error);
        })
      );
  }

  getHotelDetalle(hotelId: number): Observable<HotelDetalleResponse> {
    return this.http.get<HotelDetalleResponse>(`${baseUrl}/hoteles/${hotelId}`).pipe(
      catchError((error: any) => {
        this.logger.error('Error al obtener detalle del hotel:', error);
        return throwError(() => error);
      })
    );
  }

  getHotelesList(): Observable<HotelResponse[]> {
    return this.http.get<HotelResponse[]>(`${baseUrl}/hoteles`).pipe(
      catchError((error: any) => {
        this.logger.error('Error al obtener hoteles:', error);
        return throwError(() => error);
      })
    );
  }

  getHotelesByDepartamento(departamentoId: number): Observable<HotelResponse[]> {
    return this.http
      .get<HotelResponse[]>(`${baseUrl}/hoteles?departamentoId=${departamentoId}`)
      .pipe(
        catchError((error: any) => {
          this.logger.error('Error al obtener hoteles por departamento:', error);
          return throwError(() => error);
        })
      );
  }

  // ==================== HABITACIONES ====================

  getHabitacionesDisponibles(
    hotelId: number,
    fechaInicio: string,
    fechaFin: string
  ): Observable<HabitacionesDisponiblesResponse> {
    return this.http
      .get<HabitacionesDisponiblesResponse>(
        `${baseUrl}/hoteles/${hotelId}/habitaciones-disponibles?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      )
      .pipe(
        catchError((error: any) => {
          this.logger.error('Error al obtener habitaciones disponibles:', error);
          return throwError(() => error);
        })
      );
  }

  // ==================== RESERVAS ====================

  crearReserva(hotelId: number, reserva: ReservaRequest): Observable<ReservaCreatedResponse> {
    return this.http
      .post<ReservaCreatedResponse>(`${baseUrl}/reservas?hotelId=${hotelId}`, reserva)
      .pipe(
        catchError((error: any) => {
          this.logger.error('Error al crear reserva:', error);
          return throwError(() => error);
        })
      );
  }

  getReservaDetalle(reservaId: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${baseUrl}/reservas/${reservaId}`).pipe(
      catchError((error: any) => {
        this.logger.error('Error al obtener detalle de reserva:', error);
        return throwError(() => error);
      })
    );
  }

  getMisReservas(fechaInicio?: string, fechaFin?: string): Observable<MisReservasResponse> {
    let url = `${baseUrl}/reservas/mias`;
    const params: string[] = [];

    if (fechaInicio) {
      params.push(`fechaInicio=${fechaInicio}`);
    }
    if (fechaFin) {
      params.push(`fechaFin=${fechaFin}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<MisReservasResponse>(url).pipe(
      catchError((error: any) => {
        this.logger.error('Error al buscar reservas:', error);
        return throwError(() => error);
      })
    );
  }

  confirmarPago(reservaId: number): Observable<any> {
    return this.http.patch(`${baseUrl}/reservas/${reservaId}/pagar`, {}).pipe(
      catchError((error: any) => {
        this.logger.error('Error al confirmar pago:', error);
        return throwError(() => error);
      })
    );
  }

  cancelarReserva(reservaId: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/reservas/${reservaId}`).pipe(
      catchError((error: any) => {
        this.logger.error('Error al cancelar reserva:', error);
        return throwError(() => error);
      })
    );
  }

  actualizarReserva(
    reservaId: number,
    data: { fechaInicio: string; fechaFin: string }
  ): Observable<void> {
    return this.http.put<void>(`${baseUrl}/reservas/${reservaId}`, data).pipe(
      catchError((error: any) => {
        this.logger.error('Error al actualizar reserva:', error);
        return throwError(() => error);
      })
    );
  }
}
