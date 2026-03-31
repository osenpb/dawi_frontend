import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { DashboardStats } from '../interfaces';
import { LoggerService } from '../core/services/logger.service';
import { environment } from '../../environments/environments';

export type { DashboardStats } from '../interfaces';

const baseUrl = `${environment.apiUrl}/admin/dashboard`;

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${baseUrl}/stats`).pipe(
      catchError((error: any) => {
        this.logger.error('Error al obtener estadísticas:', error);
        return throwError(() => error);
      })
    );
  }
}
