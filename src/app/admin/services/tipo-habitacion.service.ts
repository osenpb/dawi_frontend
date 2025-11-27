import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { TipoHabitacionResponse } from '../../interfaces/tipo-habitacion/tipo-habitacion-response.interface';

const baseUrl = 'http://localhost:8080/api/public/habitaciones';

@Injectable({
  providedIn: 'root',
})
export class TipoHabitacionService {

  private http = inject(HttpClient);

  getAll(): Observable<TipoHabitacionResponse[]> {
    return this.http.get<any>(`${baseUrl}/tipos`).pipe(
      catchError((error: any) => {
        console.error('Error: ', error);
        return throwError(() => error);
      })
    );
  }
}
