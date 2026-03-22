import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators';

/**
 * Guard que protege rutas que requieren autenticación
 * Redirige a login si el usuario no está autenticado
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    // Si ya está autenticado según el signal cacheado, permitir sin HTTP
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Solo llamar al backend si no está autenticado
    return this.authService.checkAuthStatus().pipe(
      map((result) => {
        if (result === false) {
          return false;
        }
        return true;
      }),
      tap((isAuthenticated) => {
        if (!isAuthenticated) {
          this.router.navigate(['/auth/login']);
        }
      })
    );
  }
}
