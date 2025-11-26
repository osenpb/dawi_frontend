
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { TipoHabitacion } from '../interfaces/tipoHabitacion.interface';

const baseUrl = 'http://localhost:8080/api/habitaciones';

@Injectable({
  providedIn: 'root'
})
export class TipoHabitacionService {

  private http = inject(HttpClient);


  getAll() : Observable<TipoHabitacion[]> {
    return this.http.get<TipoHabitacion[]>(`${baseUrl}/tipos`).pipe(
      catchError((error: any) => {
        console.error("Error: ", error);
        return throwError(() => error);
      })
    );
  }



}
