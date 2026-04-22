import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ConfirmationUtils } from '../../utils/confirmation-utils';
import { ConfirmationDataAccessors } from '../../utils/confirmation-data-accessors';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { ReservationHeaderComponent } from '../../components/reservation-header/reservation-header.component';
import { PaymentAlertComponent } from '../../components/payment-alert/payment-alert.component';
import { ReservationDetailsComponent } from '../../components/reservation-details/reservation-details.component';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { InfoAlertComponent } from '../../components/info-alert/info-alert.component';
import { NavigationLinksComponent } from '../../components/navigation-links/navigation-links.component';
import { ReservaPublicService } from '../../../../services/reserva-public.service';
import { PdfGeneratorService } from '../../../../services/pdf-generator.service';
import { ReservaResponse } from '../../interfaces';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  standalone: true,
  selector: 'app-confirmacion-page',
  imports: [
    CommonModule,

    LoadingSpinnerComponent,
    ErrorDisplayComponent,
    ReservationHeaderComponent,
    PaymentAlertComponent,
    ReservationDetailsComponent,
    ActionButtonsComponent,
    InfoAlertComponent,
    NavigationLinksComponent
  ],
  templateUrl: './confirmacion-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmacionPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private reservaService = inject(ReservaPublicService);
  private pdfGenerator = inject(PdfGeneratorService);
  private logger = inject(LoggerService);

  reservaId = signal<number | null>(null);
  reserva = signal<ReservaResponse | null>(null);
  loading = signal<boolean>(true);
  error = signal<boolean>(false);
  pollingActivo = signal<boolean>(false);
  mensajePago = signal<string | null>(null);

  private pollIntervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('reservaId');
    const mpStatus = (this.route.snapshot.queryParamMap.get('mpStatus') || '').toLowerCase();

    if (mpStatus) {
      this.mensajePago.set(`Estado reportado por Mercado Pago: ${mpStatus}`);
    }

    if (id) {
      const reservaId = Number(id);
      this.reservaId.set(reservaId);

      if (mpStatus === 'approved') {
        this.confirmarPagoYRefrescar(reservaId);
        return;
      }

      this.loadReserva(reservaId);
    }
  }

  private confirmarPagoYRefrescar(reservaId: number): void {
    this.loading.set(true);
    this.mensajePago.set('Estado reportado por Mercado Pago: approved. Confirmando reserva...');

    this.reservaService.confirmarPago(reservaId).subscribe({
      next: () => {
        this.mensajePago.set('Pago aprobado y reserva confirmada.');
        this.loadReserva(reservaId);
      },
      error: (err) => {
        this.logger.warn('No se pudo confirmar pago inmediatamente. Consultando estado real.', err);
        this.mensajePago.set(null);
        this.loadReserva(reservaId);
      },
    });
  }

  ngOnDestroy(): void {
    this.detenerPolling();
  }

  loadReserva(id: number): void {
    this.loading.set(true);

    this.reservaService.getReservaDetalle(id).subscribe({
      next: (data) => {
        this.reserva.set(data);
        this.loading.set(false);

        if (data.estado === 'PENDIENTE') {
          this.iniciarPolling(id);
        } else {
          this.detenerPolling();
        }
      },
      error: (err) => {
        this.logger.error('Error cargando reserva:', err);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  refrescarEstado(): void {
    const id = this.reservaId();
    if (!id) return;

    this.loadReserva(id);
  }

  private iniciarPolling(id: number): void {
    if (this.pollIntervalId) {
      return;
    }

    this.pollingActivo.set(true);
    this.pollIntervalId = setInterval(() => {
      this.reservaService.getReservaDetalle(id).subscribe({
        next: (data) => {
          this.reserva.set(data);
          if (data.estado !== 'PENDIENTE') {
            this.detenerPolling();
          }
        },
        error: (err) => {
          this.logger.error('Error consultando estado de pago:', err);
        },
      });
    }, 5000);
  }

  private detenerPolling(): void {
    this.pollingActivo.set(false);
    if (!this.pollIntervalId) {
      return;
    }

    clearInterval(this.pollIntervalId);
    this.pollIntervalId = null;
  }

  // ==================== GETTERS PARA ACCESO A DATOS ====================

  get hotelNombre(): string {
    return ConfirmationDataAccessors.hotelNombre(this.reserva());
  }

  get hotelDireccion(): string {
    return ConfirmationDataAccessors.hotelDireccion(this.reserva());
  }

  get clienteNombreCompleto(): string {
    return ConfirmationDataAccessors.clienteNombreCompleto(this.reserva());
  }

  get clienteDni(): string {
    return ConfirmationDataAccessors.clienteDni(this.reserva());
  }

  get clienteEmail(): string {
    return ConfirmationDataAccessors.clienteEmail(this.reserva());
  }

  // ==================== UTILIDADES ====================

  formatDate(dateString: string): string {
    return ConfirmationUtils.formatDate(dateString);
  }

  formatCurrency(amount: number): string {
    return ConfirmationUtils.formatCurrency(amount);
  }

  calcularNoches(): number {
    return ConfirmationUtils.calcularNoches(this.reserva()!);
  }

  getHabitacionInfo(habitacionId: number): { numero: string; tipo: string; precio: number } {
    return ConfirmationUtils.getHabitacionInfo(habitacionId, this.reserva()?.hotel!);
  }

  calcularSubtotalPorNoche(): number {
    return ConfirmationUtils.calcularSubtotalPorNoche(this.reserva()!);
  }

  // ==================== GENERAR PDF ====================
  descargarPDF(): void {
    const reserva = this.reserva();
    if (!reserva) return;

    this.pdfGenerator.descargarPDF(reserva);
  }

  imprimirComprobante(): void {
    window.print();
  }

  onDescargarPDF(): void {
    this.descargarPDF();
  }

  onImprimir(): void {
    this.imprimirComprobante();
  }
}


