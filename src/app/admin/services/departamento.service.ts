import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DepartamentoResponse } from '../../interfaces/departamento/departamento-response.interface';
import { catchError, Observable, throwError } from 'rxjs';

const baseUrl = 'http://localhost:8080/api/admin';

@Injectable({
  providedIn: 'root',
})
export class DepartamentoService {
  private http = inject(HttpClient);

  getAll(): Observable<DepartamentoResponse[]> {
    return this.http.get<DepartamentoResponse[]>(`${baseUrl}/departamentos`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener departamentos:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: number): Observable<DepartamentoResponse> {
    return this.http.get<DepartamentoResponse>(`${baseUrl}/departamentos/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener departamento:', error);
        return throwError(() => error);
      })
    );
  }

  create(departamento: Omit<DepartamentoResponse, 'id'>): Observable<DepartamentoResponse> {
    return this.http.post<DepartamentoResponse>(`${baseUrl}/departamentos`, departamento).pipe(
      catchError((error: any) => {
        console.error('Error al crear departamento:', error);
        return throwError(() => error);
      })
    );
  }

  update(id: number, departamento: Omit<DepartamentoResponse, 'id'>): Observable<DepartamentoResponse> {
    return this.http.put<DepartamentoResponse>(`${baseUrl}/departamentos/${id}`, departamento).pipe(
      catchError((error: any) => {
        console.error('Error al actualizar departamento:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/departamentos/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error al eliminar departamento:', error);
        return throwError(() => error);
      })
    );
  }
}
