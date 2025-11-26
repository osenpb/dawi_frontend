import { HotelRequest } from '../interfaces/hotelRequest.interface';

import { inject, Injectable, signal } from '@angular/core';
import { Hotel } from '../interfaces/hotel.interface';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Departamento } from '../interfaces/departamento.interface';



const baseUrl = 'http://localhost:8080/api/admin'


@Injectable({
  providedIn: 'root'
})
export class HotelService {


  private http = inject(HttpClient);

  getAllHoteles(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${baseUrl}/hoteles`).pipe(
      catchError((error: any) => {
        console.error("Error: ", error);
        return throwError(() => error);
      })
    );
  }

  createHotel(hotelRequest: HotelRequest) {
    return this.http.post<HotelRequest>(`${baseUrl}/hoteles`, hotelRequest).pipe(
      catchError((error: any) => {
        console.error("Error: ", error);
        return throwError(() => error);
      })
    );
  }

  updateHotel(hotelRequest: HotelRequest) {
    return this.http.post<HotelRequest>(`${baseUrl}/hoteles`, hotelRequest).pipe(
      catchError((error: any) => {
        console.error("Error: ", error);
        return throwError(() => error);
      })
    )
  }

  getById(idHotel: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${baseUrl}/hoteles/${idHotel}`).pipe(
      catchError((error: any) => {
        console.error("Error: ", error);
        return throwError(() => error);
      })
    );
  }


  deleteById(idHotel: number) {
    return this.http.delete<number>(`${baseUrl}/hoteles/${idHotel}`).pipe(
      catchError((error: any) => {
        console.error("Error: ", error);
        return throwError(() => error)
      })
    )
  }
}
