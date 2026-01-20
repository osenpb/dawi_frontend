import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReservaPublicService } from '../../services/reserva-public.service';
import { ReservaResponse } from '../../../interfaces';
import { PdfGeneratorService } from '../../../services/pdf-generator.service';
import { ConfirmationUtils } from './confirmation-utils';
import { ConfirmationDataAccessors } from './confirmation-data-accessors';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { ReservationHeaderComponent } from '../../components/reservation-header/reservation-header.component';
import { PaymentAlertComponent } from '../../components/payment-alert/payment-alert.component';
import { ReservationDetailsComponent } from '../../components/reservation-details/reservation-details.component';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { InfoAlertComponent } from '../../components/info-alert/info-alert.component';
import { NavigationLinksComponent } from '../../components/navigation-links/navigation-links.component';

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
export class ConfirmacionPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reservaService = inject(ReservaPublicService);
  private pdfGenerator = inject(PdfGeneratorService);

  reservaId = signal<number | null>(null);
  reserva = signal<ReservaResponse | null>(null);
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('reservaId');

    if (id) {
      this.reservaId.set(Number(id));
      this.loadReserva(Number(id));
    }
  }

  loadReserva(id: number): void {
    this.loading.set(true);

    this.reservaService.getReservaDetalle(id).subscribe({
      next: (data) => {
        this.reserva.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando reserva:', err);
        this.error.set(true);
        this.loading.set(false);
      },
    });
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
