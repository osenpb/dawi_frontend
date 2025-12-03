import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservaPublicService } from '../../services/reserva-public.service';
import { HotelDetailResponse } from '../../interfaces/hotel-public.interface';
import { HabitacionPublic } from '../../interfaces/habitacion-public.interface';
import { ReservaRequest } from '../../interfaces/reserva-public.interface';
import { AuthService } from '../../../auth/services/auth.service';

interface HabitacionSeleccionada {
  index: number;
  habitacionId: number | null;
}

@Component({
  standalone: true,
  selector: 'app-reserva-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './reserva-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservaPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservaService = inject(ReservaPublicService);
  private authService = inject(AuthService);

  hotelId = signal<number | null>(null);
  hotelData = signal<HotelDetailResponse | null>(null);
  habitacionesDisponibles = signal<HabitacionPublic[]>([]);
  loading = signal<boolean>(true);
  loadingHabitaciones = signal<boolean>(false);
  submitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Lista de habitaciones seleccionadas (dinámicas)
  habitacionesSeleccionadas = signal<HabitacionSeleccionada[]>([
    { index: 1, habitacionId: null }
  ]);

  private nextIndex = 2;

  // Formulario del cliente
  clienteForm = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(2)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern(/^9\d{8}$/)]],
  });

  // Formulario de fechas
  fechasForm = this.fb.group({
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
  });

  // Fecha mínima (hoy)
  minDate = new Date().toISOString().split('T')[0];

  // Computed para calcular el total
  total = computed(() => {
    const habitaciones = this.habitacionesDisponibles();
    const seleccionadas = this.habitacionesSeleccionadas();
    
    let suma = 0;
    for (const sel of seleccionadas) {
      if (sel.habitacionId) {
        const hab = habitaciones.find(h => h.id === sel.habitacionId);
        if (hab) {
          suma += hab.precio;
        }
      }
    }
    return suma;
  });

  // Computed para obtener habitaciones disponibles para seleccionar (excluyendo ya seleccionadas)
  getHabitacionesParaSelect(currentIndex: number) {
    const habitaciones = this.habitacionesDisponibles();
    const seleccionadas = this.habitacionesSeleccionadas();
    const seleccionadasIds = seleccionadas
      .filter(s => s.index !== currentIndex && s.habitacionId !== null)
      .map(s => s.habitacionId);
    
    return habitaciones.filter(h => !seleccionadasIds.includes(h.id));
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('hotelId');

    if (id) {
      this.hotelId.set(Number(id));
      this.loadHotelData(Number(id));
      this.cargarDatosUsuario();
    } else {
      this.router.navigate(['/home/departamentos']);
    }
  }

  cargarDatosUsuario(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.clienteForm.patchValue({
        nombreCompleto: user.username || '',
        correo: user.email || '',
        telefono: user.telefono || '',
      });
    }
  }

  loadHotelData(hotelId: number): void {
    this.loading.set(true);

    this.reservaService.getHotelDetalle(hotelId).subscribe({
      next: (data) => {
        this.hotelData.set(data);
        this.loading.set(false);
        // Cargar habitaciones disponibles automáticamente
        this.cargarHabitacionesIniciales(hotelId);
      },
      error: (err) => {
        console.error('Error cargando hotel:', err);
        this.errorMessage.set('No se pudo cargar la información del hotel');
        this.loading.set(false);
      },
    });
  }

  cargarHabitacionesIniciales(hotelId: number): void {
    // Cargar habitaciones con fechas por defecto (hoy + 1 día)
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const fechaInicio = hoy.toISOString().split('T')[0];
    const fechaFin = manana.toISOString().split('T')[0];

    this.fechasForm.patchValue({
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    });

    this.buscarHabitaciones();
  }

  buscarHabitaciones(): void {
    const fechas = this.fechasForm.getRawValue();
    const hotelId = this.hotelId();

    if (!fechas.fechaInicio || !fechas.fechaFin || !hotelId) {
      return;
    }

    // Validar fechas
    const inicio = new Date(fechas.fechaInicio);
    const fin = new Date(fechas.fechaFin);

    if (fin <= inicio) {
      this.errorMessage.set('La fecha de salida debe ser posterior a la fecha de entrada');
      return;
    }

    this.errorMessage.set(null);
    this.loadingHabitaciones.set(true);

    this.reservaService
      .getHabitacionesDisponibles(hotelId, fechas.fechaInicio, fechas.fechaFin)
      .subscribe({
        next: (response) => {
          this.habitacionesDisponibles.set(response.habitacionesDisponibles || []);
          this.loadingHabitaciones.set(false);
          // Reset selecciones al cambiar fechas
          this.habitacionesSeleccionadas.set([{ index: 1, habitacionId: null }]);
          this.nextIndex = 2;
        },
        error: (err) => {
          console.error('Error buscando habitaciones:', err);
          this.habitacionesDisponibles.set([]);
          this.loadingHabitaciones.set(false);
          this.errorMessage.set('Error al buscar habitaciones disponibles');
        },
      });
  }

  onFechaChange(): void {
    const fechas = this.fechasForm.getRawValue();
    if (fechas.fechaInicio && fechas.fechaFin) {
      this.buscarHabitaciones();
    }
  }

  agregarHabitacion(): void {
    const seleccionadas = this.habitacionesSeleccionadas();
    const disponibles = this.habitacionesDisponibles();
    
    // Verificar si hay más habitaciones disponibles
    const idsSeleccionados = seleccionadas
      .filter(s => s.habitacionId !== null)
      .map(s => s.habitacionId);
    
    const habsRestantes = disponibles.filter(h => !idsSeleccionados.includes(h.id));
    
    if (habsRestantes.length > 0) {
      this.habitacionesSeleccionadas.set([
        ...seleccionadas,
        { index: this.nextIndex++, habitacionId: null }
      ]);
    }
  }

  quitarHabitacion(index: number): void {
    const seleccionadas = this.habitacionesSeleccionadas();
    if (seleccionadas.length > 1) {
      this.habitacionesSeleccionadas.set(
        seleccionadas.filter(s => s.index !== index)
      );
    }
  }

  onHabitacionChange(index: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const habitacionId = select.value ? Number(select.value) : null;
    
    const seleccionadas = this.habitacionesSeleccionadas();
    this.habitacionesSeleccionadas.set(
      seleccionadas.map(s => 
        s.index === index ? { ...s, habitacionId } : s
      )
    );
  }

  getHabitacionInfo(habitacionId: number): HabitacionPublic | undefined {
    return this.habitacionesDisponibles().find(h => h.id === habitacionId);
  }

  onSubmit(): void {
    // Validar formulario de cliente
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.errorMessage.set('Complete todos los datos del cliente correctamente');
      return;
    }

    // Validar fechas
    if (this.fechasForm.invalid) {
      this.errorMessage.set('Seleccione las fechas de entrada y salida');
      return;
    }

    // Obtener IDs de habitaciones seleccionadas
    const habitacionesIds = this.habitacionesSeleccionadas()
      .filter(s => s.habitacionId !== null)
      .map(s => s.habitacionId as number);

    if (habitacionesIds.length === 0) {
      this.errorMessage.set('Seleccione al menos una habitación');
      return;
    }

    const hotelId = this.hotelId();
    if (!hotelId) return;

    const clienteData = this.clienteForm.getRawValue();
    const fechasData = this.fechasForm.getRawValue();

    // Separar nombre completo en nombre y apellido
    const nombreParts = (clienteData.nombreCompleto || '').trim().split(' ');
    const nombre = nombreParts[0] || '';
    const apellido = nombreParts.slice(1).join(' ') || '';

    const reservaRequest: ReservaRequest = {
      fechaInicio: fechasData.fechaInicio!,
      fechaFin: fechasData.fechaFin!,
      habitacionesIds: habitacionesIds,
      cliente: {
        dni: clienteData.dni!,
        nombre: nombre,
        apellido: apellido,
        email: clienteData.correo!,
        telefono: clienteData.telefono || undefined,
      },
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.reservaService.crearReserva(hotelId, reservaRequest).subscribe({
      next: (response) => {
        // Redirigir a página de pago
        this.router.navigate(['/home/reserva', response.id, 'pago']);
      },
      error: (err) => {
        console.error('Error creando reserva:', err);
        this.submitting.set(false);
        this.errorMessage.set(err.error?.error || 'Error al crear la reserva. Intente nuevamente.');
      },
    });
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  // Getters para validaciones
  get nombreCompletoInvalid(): boolean {
    const control = this.clienteForm.get('nombreCompleto');
    return !!(control?.invalid && control?.touched);
  }

  get dniInvalid(): boolean {
    const control = this.clienteForm.get('dni');
    return !!(control?.invalid && control?.touched);
  }

  get correoInvalid(): boolean {
    const control = this.clienteForm.get('correo');
    return !!(control?.invalid && control?.touched);
  }

  get telefonoInvalid(): boolean {
    const control = this.clienteForm.get('telefono');
    return !!(control?.invalid && control?.touched);
  }
}
