import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ReservaListResponse, ReservaAdminUpdateDTO } from '../interfaces';
import { environment } from '../../environments/environments.prod';

const baseUrl = `${environment.apiUrl}/admin`;

@Injectable({
  providedIn: 'root',
})
export class ReservaService {

  private http = inject(HttpClient);

  getAll(): Observable<ReservaListResponse[]> {
    return this.http.get<ReservaListResponse[]>(`${baseUrl}/reservas`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener reservas:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: number): Observable<ReservaListResponse> {
    return this.http.get<ReservaListResponse>(`${baseUrl}/reservas/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener reserva:', error);
        return throwError(() => error);
      })
    );
  }

  buscarPorDni(dni: string): Observable<ReservaListResponse[]> {
    return this.http
      .get<ReservaListResponse[]>(`${baseUrl}/reservas/buscar`, {
        params: { dni },
      })
      .pipe(
        catchError((error: any) => {
          console.error('Error al buscar reservas por DNI:', error);
          return throwError(() => error);
        })
      );
  }

  update(id: number, reserva: ReservaAdminUpdateDTO): Observable<ReservaListResponse> {
    return this.http.put<ReservaListResponse>(`${baseUrl}/reservas/${id}`, reserva).pipe(
      catchError((error: any) => {
        console.error('Error al actualizar reserva:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/reservas/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error al eliminar reserva:', error);
        return throwError(() => error);
      })
    );
  }
}
