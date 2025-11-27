import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { HotelResponse } from '../../interfaces/hotel/hotel-response.interface';
import { HotelRequest } from '../../interfaces/hotel/hotel-request.interface';

const baseUrl = 'http://localhost:8080/api/admin';

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  private http = inject(HttpClient);

  getAllHoteles(): Observable<HotelResponse[]> {
    return this.http.get<HotelResponse[]>(`${baseUrl}/hoteles`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener hoteles:', error);
        return throwError(() => error);
      })
    );
  }

  getById(idHotel: number): Observable<HotelResponse> {
    return this.http.get<HotelResponse>(`${baseUrl}/hoteles/${idHotel}`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener hotel:', error);
        return throwError(() => error);
      })
    );
  }

  createHotel(hotelRequest: HotelRequest): Observable<HotelRequest> {
    return this.http.post<HotelRequest>(`${baseUrl}/hoteles`, hotelRequest).pipe(
      catchError((error: any) => {
        console.error('Error al crear hotel:', error);
        return throwError(() => error);
      })
    );
  }

  updateHotel(id: number, hotelRequest: HotelRequest): Observable<HotelRequest> {
    return this.http.put<HotelRequest>(`${baseUrl}/hoteles/${id}`, hotelRequest).pipe(
      catchError((error: any) => {
        console.error('Error al actualizar hotel:', error);
        return throwError(() => error);
      })
    );
  }

  deleteById(idHotel: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/hoteles/${idHotel}`).pipe(
      catchError((error: any) => {
        console.error('Error al eliminar hotel:', error);
        return throwError(() => error);
      })
    );
  }
}
