import { ChangeDetectionStrategy, Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { NotificationService } from '../../../../core/services/notification.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {

  authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggerService);
  private notification = inject(NotificationService);

  // Signals derivados del AuthService, para no tener que duplicar
  usuario = this.authService.user;
  isAuthenticated = this.authService.isAuthenticated;

  // Signals locales para UI
  userMenuOpen = signal(false);
  mobileMenuOpen = signal(false);

  constructor() {
    effect(() => {
      const currentUser = this.usuario();
      const authStatus = this.isAuthenticated();

      this.logger.log('Navbar - Estado de autenticación:', {
        usuario: currentUser,
        autenticado: authStatus
      });
    });
  }

  toggleUserMenu() {
    this.userMenuOpen.update(value => !value);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  logout() {
    this.authService.logout();
    this.userMenuOpen.set(false);
    this.router.navigate(['/auth/login']);
  }
}
