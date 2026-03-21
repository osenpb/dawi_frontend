import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que previene acceso a páginas de login/registro
 * cuando el usuario ya está autenticado
 * Redirige automáticamente según el rol del usuario
 */
@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    // Si no está autenticado según signal cacheado, permitir acceso a login
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    // Si está autenticado, redirigir
    const isAdmin = this.authService.isAdmin();
    if (isAdmin) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/home']);
    }
    return false;
  }
}