import { ReservaListResponse } from '../../../../../interfaces';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../../../../services/reserva.service';
import { LoggerService } from '../../../../../core/services/logger.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CurrencySolPipe } from '../../../../../shared/pipes/currency-sol.pipe';
import { EstadoBadgePipe } from '../../../../../shared/pipes/estado-badge.pipe';
import { FormatDatePipe } from '../../../../../shared/pipes/format-date.pipe';

@Component({
  standalone: true,
  selector: 'app-list-reserva',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CurrencySolPipe,
    EstadoBadgePipe,
    FormatDatePipe,
  ],
  templateUrl: './list-reserva.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListReservaPageComponent {
  private reservaService = inject(ReservaService);
  private logger = inject(LoggerService);
  private notification = inject(NotificationService);

  reservas = signal<ReservaListResponse[]>([]);
  reservasFiltradas = signal<ReservaListResponse[]>([]);
  loading = signal<boolean>(true);
  successMessage = signal<string | null>(null);

  // Filtros
  filtroFechaDesde = signal<string>('');
  filtroFechaHasta = signal<string>('');
  filtroEstado = signal<string>('TODOS');

  // Modal eliminar
  showModalEliminar = signal<boolean>(false);
  reservaSeleccionada = signal<ReservaListResponse | null>(null);
  procesando = signal<boolean>(false);

  constructor() {
    this.loadReservas();
  }

  loadReservas(): void {
    this.loading.set(true);

    this.reservaService.getAll().subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: (err) => {
        this.logger.error('Error cargando reservas', err);
        this.loading.set(false);
      },
    });
  }

  aplicarFiltros(): void {
    let resultado = this.reservas();

    // Filtrar por fecha de reserva DESDE (fechaReserva >= filtroFechaDesde)
    const fechaDesde = this.filtroFechaDesde();
    if (fechaDesde) {
      resultado = resultado.filter((r) => r.fechaReserva >= fechaDesde);
    }

    // Filtrar por fecha de reserva HASTA (fechaReserva <= filtroFechaHasta)
    const fechaHasta = this.filtroFechaHasta();
    if (fechaHasta) {
      resultado = resultado.filter((r) => r.fechaReserva <= fechaHasta);
    }

    // Filtrar por estado
    const estado = this.filtroEstado();
    if (estado !== 'TODOS') {
      resultado = resultado.filter((r) => r.estado === estado);
    }

    this.reservasFiltradas.set(resultado);
  }

  onFiltroFechaDesdeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroFechaDesde.set(input.value);
    this.aplicarFiltros();
  }

  onFiltroFechaHastaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroFechaHasta.set(input.value);
    this.aplicarFiltros();
  }

  onFiltroEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value);
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
    this.filtroEstado.set('TODOS');
    this.aplicarFiltros();
  }

  hayFiltrosActivos(): boolean {
    return (
      this.filtroFechaDesde() !== '' ||
      this.filtroFechaHasta() !== '' ||
      this.filtroEstado() !== 'TODOS'
    );
  }

  // === MODAL ELIMINAR ===
  abrirModalEliminar(reserva: ReservaListResponse): void {
    this.reservaSeleccionada.set(reserva);
    this.showModalEliminar.set(true);
  }

  cerrarModalEliminar(): void {
    this.showModalEliminar.set(false);
    this.reservaSeleccionada.set(null);
  }

  confirmarEliminar(): void {
    const reserva = this.reservaSeleccionada();
    if (!reserva) return;

    this.procesando.set(true);

    this.reservaService.delete(reserva.id).subscribe({
      next: () => {
        this.procesando.set(false);
        this.cerrarModalEliminar();
        this.successMessage.set(`Reserva #${reserva.id} eliminada exitosamente`);

        // Recargar lista
        this.loadReservas();

        // Ocultar mensaje después de 5 segundos
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.logger.error('Error eliminando reserva', err);
        this.procesando.set(false);
        this.cerrarModalEliminar();
        this.notification.error('No se pudo eliminar la reserva');
      },
    });
  }
}
