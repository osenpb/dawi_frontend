import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ReservaService } from '../../../services/reserva.service';
import { Reserva } from '../../../../interfaces/reserva/reserva.interface';

@Component({
  standalone: true,
  selector: 'app-list-reserva',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './list-reserva.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListReservaComponent {
  private reservaService = inject(ReservaService);

  reservas = signal<Reserva[]>([]);
  loading = signal<boolean>(true);
  dniBusqueda = signal<string>('');
  modoFiltrado = signal<boolean>(false);

  constructor() {
    this.loadReservas();
  }

  loadReservas(): void {
    this.loading.set(true);
    this.modoFiltrado.set(false);
    this.dniBusqueda.set('');

    this.reservaService.getAll().subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando reservas', err);
        this.loading.set(false);
      },
    });
  }

  buscarPorDni(): void {
    const dni = this.dniBusqueda().trim();

    if (!dni) {
      this.loadReservas();
      return;
    }

    if (dni.length !== 8) {
      alert('El DNI debe tener 8 dígitos');
      return;
    }

    this.loading.set(true);
    this.modoFiltrado.set(true);

    this.reservaService.buscarPorDni(dni).subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error buscando por DNI', err);
        this.reservas.set([]);
        this.loading.set(false);
      },
    });
  }

  mostrarTodas(): void {
    this.loadReservas();
  }

  eliminarReserva(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      this.reservaService.delete(id).subscribe({
        next: () => {
          if (this.modoFiltrado()) {
            this.buscarPorDni();
          } else {
            this.loadReservas();
          }
        },
        error: (err) => {
          console.error('Error eliminando reserva', err);
          alert('No se pudo eliminar la reserva');
        },
      });
    }
  }

  onDniInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dniBusqueda.set(input.value);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-800';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }
}
