import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Departamento } from '../interfaces/departamento.interface';
import { catchError, Observable, throwError } from 'rxjs';


const baseUrl = 'http://localhost:8080/api/admin'

@Injectable({
  providedIn: 'root'
})
export class DepartamentoService {

  private http = inject(HttpClient);

    getAll(): Observable<Departamento[]> {
      return this.http.get<Departamento[]>(`${baseUrl}/departamentos`).pipe(
        catchError((error: any) => {
          console.error("Error: ", error);
          return throwError(() => error);
        })
      );
    }




}
