import { HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const logger = inject(LoggerService);
  // Obtener token del localStorage directamente
  const token = localStorage.getItem('token');

  // Solo agregar token si existe y no es ruta de auth
  if (
    token &&
    !req.url.includes('/api/auth/login') &&
    !req.url.includes('/api/auth/register')
  ) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo limpiar localStorage si es 401 y NO es una petición a /me
      // Esto evita que se pierda la sesión durante la verificación inicial
      if (error.status === 401 && !req.url.includes('/api/v1/auth/')) {
        logger.warn('Error 401 detectado en:', req.url);
        // No redirigir automáticamente, dejar que el componente maneje el error
        // Solo limpiar el storage si el token es inválido
        if (!req.url.includes('/me')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      return throwError(() => error);
    })
  );
}
