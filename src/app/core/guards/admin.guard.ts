import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators';

/**
 * Guard que protege rutas administrativas
 * Solo permite acceso a usuarios con rol ADMIN
 */
@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    // Si ya está autenticado y es admin según signals cacheados, permitir sin HTTP
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return true;
    }

    return this.authService.checkAuthStatus().pipe(
      map((result) => {
        if (result === false) {
          return false;
        }
        return this.authService.isAdmin();
      }),
      tap((isAuthorized) => {
        if (!isAuthorized) {
          if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/auth/login']);
          } else {
            this.router.navigate(['/home']);
          }
        }
      })
    );
  }
}
