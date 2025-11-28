import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';


interface Usuario {
  id: number;
  nombre: string;
  email: string;
  avatar?: string;
  rol?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para el estado
  usuario = signal<Usuario | null>(null);
  userMenuOpen = signal(false);
  mobileMenuOpen = signal(false);

  ngOnInit(): void {
    // Cargar usuario autenticado
    this.loadUser();

    // Escuchar cambios en el estado de autenticación
    this.authService.currentUser$.subscribe(user => {
      this.usuario.set(user);
    });
  }

  loadUser() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.usuario.set(currentUser);
    }
  }

  toggleUserMenu() {
    this.userMenuOpen.update(value => !value);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
      this.usuario.set(null);
      this.userMenuOpen.set(false);
      this.router.navigate(['/auth/login']);
    }
  }
}
