import {
  ChangeDetectionStrategy,
  Component,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservaPublicService } from '../../../../services/reserva-public.service';
import { CheckoutApiRequest, ReservaResponse } from '../../interfaces';
import { LoggerService } from '../../../../core/services/logger.service';
import { CurrencySolPipe } from '../../../../shared/pipes/currency-sol.pipe';
import { environment } from '../../../../../environments/environments';

interface MercadoPagoCardFormData {
  token: string;
  issuerId?: string;
  paymentMethodId?: string;
  installments?: string;
  cardholderEmail?: string;
  identificationType?: string;
  identificationNumber?: string;
}

interface MercadoPagoCardForm {
  getCardFormData: () => MercadoPagoCardFormData;
  unmount?: () => void;
  destroy?: () => void;
}

interface MercadoPagoInstance {
  cardForm: (options: {
    amount: string;
    autoMount: boolean;
    form: {
      id: string;
      cardholderName: { id: string; placeholder?: string };
      cardholderEmail: { id: string; placeholder?: string };
      cardNumber: { id: string; placeholder?: string };
      cardExpirationMonth: { id: string; placeholder?: string };
      cardExpirationYear: { id: string; placeholder?: string };
      securityCode: { id: string; placeholder?: string };
      installments: { id: string; placeholder?: string };
      identificationType: { id: string; placeholder?: string };
      identificationNumber: { id: string; placeholder?: string };
      issuer: { id: string; placeholder?: string };
    };
    callbacks: {
      onFormMounted?: (error?: unknown) => void;
      onSubmit?: (event: Event) => void;
      onFetching?: (resource: string) => void;
    };
  }) => MercadoPagoCardForm;
}

interface MercadoPagoConstructor {
  new (publicKey: string, options?: { locale?: string }): MercadoPagoInstance;
}

declare global {
  interface Window {
    MercadoPago?: MercadoPagoConstructor;
  }
}

@Component({
  standalone: true,
  selector: 'app-pago-page',
  imports: [CommonModule, RouterLink, CurrencySolPipe],
  templateUrl: './pago-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagoPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservaService = inject(ReservaPublicService);
  private logger = inject(LoggerService);
  private ngZone = inject(NgZone);
  private cardForm: MercadoPagoCardForm | null = null;
  private lastIdempotencyKey: string | null = null;
  private cardFormMountTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private cardFormInitRetries = 0;
  private readonly maxCardFormInitRetries = 2;

  reservaId = signal<number | null>(null);
  reserva = signal<ReservaResponse | null>(null);
  loading = signal<boolean>(true);
  procesando = signal<boolean>(false);
  sdkReady = signal<boolean>(false);
  cardFormReady = signal<boolean>(false);
  statusMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  total = computed(() => {
    const res = this.reserva();
    if (!res) return 0;
    return res.total;
  });

  puedePagar = computed(() => {
    const reserva = this.reserva();
    if (!reserva) return false;
    return reserva.estado === 'PENDIENTE';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('reservaId');
    if (id) {
      this.reservaId.set(Number(id));
      void this.loadReserva(Number(id));
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    this.clearMountTimeout();
    this.limpiarCardFormActual();
  }

  async loadReserva(id: number): Promise<void> {
    this.loading.set(true);
    this.reservaService.getReservaDetalle(id).subscribe({
      next: async (data) => {
        this.reserva.set(data);
        this.loading.set(false);

        if (data.estado !== 'PENDIENTE') {
          this.statusMessage.set('Esta reserva ya no está pendiente de pago.');
          return;
        }

        try {
          await this.ensureMercadoPagoSdk();
          this.inicializarCardFormDespuesDeRender();
        } catch (error) {
          this.logger.error('Error inicializando SDK de Mercado Pago:', error);
          this.errorMessage.set('No se pudo inicializar Mercado Pago. Recarga la página e intenta nuevamente.');
        }
      },
      error: (err) => {
        this.logger.error('Error cargando reserva:', err);
        this.errorMessage.set('No se pudo cargar la información de la reserva');
        this.loading.set(false);
      },
    });
  }

  reintentarCargaSdk(): void {
    void this.ensureMercadoPagoSdk()
      .then(() => this.inicializarCardFormDespuesDeRender(true))
      .catch((error) => {
        this.logger.error('Error reintentando carga de SDK:', error);
        this.errorMessage.set('No se pudo cargar Mercado Pago. Verifica tu conexión e intenta otra vez.');
      });
  }

  private inicializarCardFormDespuesDeRender(resetRetries = true): void {
    if (resetRetries) {
      this.cardFormInitRetries = 0;
    }

    this.cardFormReady.set(false);
    this.clearMountTimeout();
    this.startMountTimeout();

    // El CardForm requiere que el DOM ya esté pintado para montar sus iframes seguros.
    requestAnimationFrame(() => {
      setTimeout(() => {
        void this.inicializarCardForm();
      }, 0);
    });
  }

  private async ensureMercadoPagoSdk(): Promise<void> {
    if (window.MercadoPago) {
      this.sdkReady.set(true);
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar sdk.mercadopago.com'));
      document.body.appendChild(script);
    });

    this.sdkReady.set(true);
  }

  private async inicializarCardForm(): Promise<void> {
    const reserva = this.reserva();
    const reservaId = this.reservaId();
    const mpPublicKey = environment.mpPublicKey?.trim();

    if (!reserva || !reservaId || !window.MercadoPago) {
      this.errorMessage.set('No se pudo inicializar el formulario de pago.');
      return;
    }

    if (!mpPublicKey || mpPublicKey.includes('REEMPLAZAR')) {
      this.errorMessage.set('La llave publica de Mercado Pago no esta configurada correctamente.');
      return;
    }

    const contenedoresListos = await this.esperarContenedoresCardForm();

    if (!contenedoresListos) {
      this.reintentarMontajeCardForm('No se encontraron los contenedores de tarjeta en la pagina.');
      return;
    }

    const cardNumberContainer = document.getElementById('form-checkout__cardNumber');
    const securityCodeContainer = document.getElementById('form-checkout__securityCode');

    if (!cardNumberContainer || !securityCodeContainer) {
      this.reintentarMontajeCardForm('No se encontraron los contenedores de tarjeta en la pagina.');
      return;
    }

    this.limpiarCardFormActual();
    (cardNumberContainer as HTMLInputElement).value = '';
    (securityCodeContainer as HTMLInputElement).value = '';

    this.errorMessage.set(null);
    this.statusMessage.set(null);

    const mp = new window.MercadoPago(mpPublicKey, {
      locale: 'es-PE',
    });

    this.cardForm = mp.cardForm({
      amount: String(reserva.total),
      autoMount: true,
      form: {
        id: 'form-checkout',
        cardholderName: {
          id: 'form-checkout__cardholderName',
          placeholder: 'Nombre como figura en tarjeta',
        },
        cardholderEmail: {
          id: 'form-checkout__cardholderEmail',
          placeholder: 'correo@ejemplo.com',
        },
        cardNumber: {
          id: 'form-checkout__cardNumber',
          placeholder: 'Número de tarjeta',
        },
        cardExpirationMonth: {
          id: 'form-checkout__cardExpirationMonth',
          placeholder: 'MM',
        },
        cardExpirationYear: {
          id: 'form-checkout__cardExpirationYear',
          placeholder: 'YY',
        },
        securityCode: {
          id: 'form-checkout__securityCode',
          placeholder: 'CVV',
        },
        installments: {
          id: 'form-checkout__installments',
          placeholder: 'Cuotas',
        },
        identificationType: {
          id: 'form-checkout__identificationType',
          placeholder: 'Tipo',
        },
        identificationNumber: {
          id: 'form-checkout__identificationNumber',
          placeholder: 'Número',
        },
        issuer: {
          id: 'form-checkout__issuer',
          placeholder: 'Banco emisor',
        },
      },
      callbacks: {
        onFormMounted: (error?: unknown) => {
          this.ngZone.run(() => {
            if (error) {
              this.logger.error('Error montando cardForm de Mercado Pago:', error);
              this.reintentarMontajeCardForm(
                `Mercado Pago no pudo montar el formulario: ${this.toErrorText(error)}`,
              );
              return;
            }

            this.clearMountTimeout();
            this.cardFormInitRetries = 0;
            this.cardFormReady.set(true);
          });
        },
        onSubmit: (event: Event) => {
          event.preventDefault();
          void this.ngZone.run(async () => {
            await this.procesarPagoConCardForm();
          });
        },
      },
    });
  }

  private async procesarPagoConCardForm(): Promise<void> {
    if (!this.cardForm) {
      this.errorMessage.set('El formulario de pago no está listo todavía.');
      return;
    }

    this.procesando.set(true);
    this.errorMessage.set(null);
    this.statusMessage.set(null);

    const reservaId = this.reservaId();
    const reserva = this.reserva();

    if (!reservaId) {
      this.errorMessage.set('ID de reserva no válido');
      this.procesando.set(false);
      return;
    }

    if (!reserva) {
      this.errorMessage.set('No se encontró la reserva a pagar.');
      this.procesando.set(false);
      return;
    }

    try {
      const cardData = this.cardForm.getCardFormData();
      const idempotencyKey = this.lastIdempotencyKey ?? this.generarIdempotencyKey();
      this.lastIdempotencyKey = idempotencyKey;

      const docType = (cardData.identificationType || 'DNI').trim();
      const docNumber = (cardData.identificationNumber || reserva.usuarioDni || '').trim();

      if (!docNumber) {
        this.procesando.set(false);
        this.errorMessage.set('Ingrese un numero de documento para continuar con el pago.');
        return;
      }

      const cardToken = (cardData.token || '').trim();

      if (!cardToken) {
        this.procesando.set(false);
        this.lastIdempotencyKey = null;
        this.errorMessage.set(
          'No se pudo generar el token de la tarjeta. Vuelve a ingresar los datos e intenta nuevamente.',
        );
        this.inicializarCardFormDespuesDeRender();
        return;
      }

      const request: CheckoutApiRequest = {
        reservaId,
        token: cardToken,
        issuerId: cardData.issuerId,
        paymentMethodId: this.normalizarPaymentMethodId(cardData.paymentMethodId),
        installments: Number(cardData.installments || 1),
        transactionAmount: reserva.total,
        description: `Reserva #${reservaId} - Ayni Hoteles`,
        docType,
        docNumber,
        payer: {
          email: cardData.cardholderEmail || reserva.usuarioEmail,
          identification: {
            type: docType,
            number: docNumber,
          },
        },
      };

      this.ejecutarCheckoutApi(request, idempotencyKey, reservaId).subscribe({
        next: (response) => {
          this.procesando.set(false);

          const status = this.normalizarCodigoEstado(response.status);
          const statusDetail = this.normalizarCodigoEstado(response.statusDetail);

          if (this.esEstadoAprobado(status, statusDetail)) {
            this.reservaService.confirmarPago(reservaId).subscribe({
              next: () => {
                this.router.navigate(['/home/reserva', reservaId, 'confirmacion'], {
                  queryParams: {
                    paymentId: response.paymentId,
                    mpStatus: response.status,
                  },
                });
              },
              error: () => {
                // Si no confirma en este punto, confirmacion-page volvera a intentarlo.
                this.router.navigate(['/home/reserva', reservaId, 'confirmacion'], {
                  queryParams: {
                    paymentId: response.paymentId,
                    mpStatus: response.status,
                  },
                });
              },
            });
            return;
          }

          if (this.esEstadoPendiente(status, statusDetail)) {
            this.statusMessage.set(
              'El pago fue recibido y esta en validacion. Te llevamos a la confirmacion para seguir el estado.',
            );
            this.router.navigate(['/home/reserva', reservaId, 'confirmacion'], {
              queryParams: {
                paymentId: response.paymentId,
                mpStatus: response.status,
              },
            });
            return;
          }

          this.lastIdempotencyKey = null;
          this.errorMessage.set(this.construirMensajePagoNoConfirmado(status, statusDetail));
        },
        error: (err) => {
          const errorStatus = this.normalizarCodigoEstado(err?.error?.status);
          const errorStatusDetail = this.normalizarCodigoEstado(
            err?.error?.statusDetail || err?.error?.cause?.[0]?.description,
          );

          if (this.esEstadoPendiente(errorStatus, errorStatusDetail)) {
            this.procesando.set(false);
            this.lastIdempotencyKey = null;
            this.statusMessage.set(
              'El pago quedo en estado pendiente. Te llevamos a la confirmacion para seguir el estado.',
            );
            this.router.navigate(['/home/reserva', reservaId, 'confirmacion'], {
              queryParams: {
                paymentId: err?.error?.paymentId,
                mpStatus: err?.error?.status || 'pending',
              },
            });
            return;
          }

          if (this.esErrorCardTokenInvalido(err)) {
            this.logger.warn('Mercado Pago devolvio token invalido, se regenerara cardForm.', err);
            this.procesando.set(false);
            this.lastIdempotencyKey = null;
            this.errorMessage.set(
              'La sesion segura de la tarjeta expiro o fue invalidada. Ingresa nuevamente los datos y vuelve a pagar.',
            );
            this.inicializarCardFormDespuesDeRender();
            return;
          }

          if (this.esErrorPaymentMethodInvalido(err)) {
            this.logger.warn('Mercado Pago devolvio payment_method_id invalido.', err);
            this.procesando.set(false);
            this.lastIdempotencyKey = null;
            this.errorMessage.set(
              'Mercado Pago no acepto el metodo de pago detectado para esta tarjeta. Reingresa la tarjeta e intenta otra vez.',
            );
            this.inicializarCardFormDespuesDeRender();
            return;
          }

          this.logger.error('Error en Checkout API:', err);
          this.procesando.set(false);
          this.lastIdempotencyKey = null;
          this.errorMessage.set(
            err.error?.message || 'Error al procesar el pago. Revisa los datos e intenta nuevamente.',
          );
        },
      });
    } catch (error) {
      this.logger.error('Error obteniendo datos de tarjeta:', error);
      this.procesando.set(false);
      this.lastIdempotencyKey = null;
      this.errorMessage.set('No se pudieron leer los datos de la tarjeta. Intenta nuevamente.');
    }
  }

  private generarIdempotencyKey(): string {
    if ('randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private ejecutarCheckoutApi(
    request: CheckoutApiRequest,
    idempotencyKey: string,
    reservaId: number,
  ) {
    this.logger.log('Checkout API request', {
      reservaId,
      paymentMethodId: request.paymentMethodId,
      installments: request.installments,
      docType: request.docType,
    });

    return this.reservaService.pagarCheckoutApi(request, idempotencyKey);
  }

  private normalizarPaymentMethodId(paymentMethodId?: string): string | undefined {
    const normalized = paymentMethodId?.trim().toLowerCase();
    return normalized || undefined;
  }

  private normalizarCodigoEstado(value?: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private esEstadoAprobado(status: string, statusDetail: string): boolean {
    return status === 'approved' || status === 'apro' || statusDetail === 'apro';
  }

  private esEstadoPendiente(status: string, statusDetail: string): boolean {
    if (!status && !statusDetail) {
      return false;
    }

    return (
      status === 'pending' ||
      status === 'in_process' ||
      status === 'cont' ||
      statusDetail === 'cont' ||
      status.includes('pending') ||
      statusDetail.includes('pending') ||
      statusDetail.startsWith('cont')
    );
  }

  private construirMensajePagoNoConfirmado(status: string, statusDetail: string): string {
    const code = (statusDetail || status || '').toUpperCase();

    const motivos: Record<string, string> = {
      OTHE: 'rechazado por error general.',
      CALL: 'rechazado con validacion para autorizar.',
      FUND: 'rechazado por importe insuficiente.',
      SECU: 'rechazado por codigo de seguridad invalido.',
      EXPI: 'rechazado por problema de fecha de vencimiento.',
      FORM: 'rechazado por error de formulario.',
    };

    const motivo = motivos[code] || 'no fue posible confirmar el pago con los datos enviados.';
    return `Pago no confirmado: ${motivo}`;
  }

  private esErrorPaymentMethodInvalido(error: any): boolean {
    const message = String(error?.error?.message || '').toLowerCase();
    const causeDescription = String(error?.error?.cause?.[0]?.description || '').toLowerCase();

    return (
      message.includes('invalid payment_method_id') ||
      causeDescription.includes('invalid payment_method_id')
    );
  }

  private esErrorCardTokenInvalido(error: any): boolean {
    const message = String(error?.error?.message || '').toLowerCase();
    const causeDescription = String(error?.error?.cause?.[0]?.description || '').toLowerCase();

    return (
      message.includes('invalid card_token_id') || causeDescription.includes('invalid card_token_id')
    );
  }

  private startMountTimeout(): void {
    this.cardFormMountTimeoutId = setTimeout(() => {
      if (this.cardFormReady()) {
        return;
      }

      this.reintentarMontajeCardForm(
        'Mercado Pago no termino de cargar el formulario de tarjeta. Verifica la llave publica y revisa la consola del navegador.',
      );
    }, 8000);
  }

  private reintentarMontajeCardForm(mensajeFinal: string): void {
    this.clearMountTimeout();

    if (this.cardFormInitRetries < this.maxCardFormInitRetries) {
      this.cardFormInitRetries += 1;
      this.statusMessage.set(
        `Reintentando cargar formulario de tarjeta (${this.cardFormInitRetries}/${this.maxCardFormInitRetries})...`,
      );
      this.inicializarCardFormDespuesDeRender(false);
      return;
    }

    this.errorMessage.set(mensajeFinal);
  }

  private async esperarContenedoresCardForm(
    maxIntentos = 15,
    pausaMs = 80,
  ): Promise<boolean> {
    for (let intento = 0; intento < maxIntentos; intento += 1) {
      const cardNumberContainer = document.getElementById('form-checkout__cardNumber');
      const securityCodeContainer = document.getElementById('form-checkout__securityCode');

      if (cardNumberContainer && securityCodeContainer) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, pausaMs));
    }

    return false;
  }

  private limpiarCardFormActual(): void {
    if (!this.cardForm) {
      return;
    }

    try {
      this.cardForm.unmount?.();
      this.cardForm.destroy?.();
    } catch (error) {
      this.logger.warn('No se pudo limpiar cardForm anterior.', error);
    }

    this.cardForm = null;
  }

  private clearMountTimeout(): void {
    if (!this.cardFormMountTimeoutId) {
      return;
    }

    clearTimeout(this.cardFormMountTimeoutId);
    this.cardFormMountTimeoutId = null;
  }

  private toErrorText(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return 'Error desconocido';
    }
  }
}
