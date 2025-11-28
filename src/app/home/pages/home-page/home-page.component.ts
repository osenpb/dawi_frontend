import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservaPublicService } from '../../services/reserva-public.service';
import { DepartamentoPublic } from '../../interfaces/departamento-public.interface';
import { NavbarComponent } from "../../layout/navbar/navbar.component";

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private reservaService = inject(ReservaPublicService);

  departamentosDestacados = signal<DepartamentoPublic[]>([]);
  loading = signal<boolean>(true);

  constructor() {
    this.loadDepartamentosDestacados();
  }

  loadDepartamentosDestacados(): void {
    this.reservaService.getDepartamentos().subscribe({
      next: (data) => {
        // Mostrar solo los primeros 4 departamentos
        this.departamentosDestacados.set(data.slice(0, 4));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando departamentos:', err);
        this.loading.set(false);
      },
    });
  }

  getImagenDepartamento(nombre: string): string { // esto sobra creo, verificar luego
    const nombreLower = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return `https://source.unsplash.com/600x400/?${nombreLower},peru,travel`;
  }
}
