import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { TipoHabitacionResponse } from '../interfaces';
import { LoggerService } from '../core/services/logger.service';
import { environment } from '../../environments/environments';


const baseUrl = `${environment.apiUrl}/public/habitaciones`;

@Injectable({
  providedIn: 'root',
})
export class TipoHabitacionService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  getAll(): Observable<TipoHabitacionResponse[]> {
    return this.http.get<TipoHabitacionResponse[]>(`${baseUrl}/tipos`).pipe(
      catchError((error: any) => {
        this.logger.error('Error al obtener tipos de habitación:', error);
        return throwError(() => error);
      })
    );
  }
}
