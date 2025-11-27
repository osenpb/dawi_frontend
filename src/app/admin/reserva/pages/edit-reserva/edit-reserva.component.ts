import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservaService } from '../../../services/reserva.service';
import { HotelService } from '../../../services/hotel.service';

import { HotelResponse } from '../../../../interfaces/hotel/hotel-response.interface';
import { HabitacionResponse } from '../../../../interfaces/habitacion/habitacion-response.interface';
import { Reserva, ReservaAdminUpdateDTO } from '../../../../interfaces/reserva/reserva.interface';


@Component({
  standalone: true,
  selector: 'app-edit-reserva',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-reserva.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditReservaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  private hotelService = inject(HotelService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  reservaId = signal<number | null>(null);
  reserva = signal<Reserva | null>(null);
  hoteles = signal<HotelResponse[]>([]);
  habitacionesDisponibles = signal<HabitacionResponse[]>([]);
  habitacionesSeleccionadas = signal<number[]>([]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);

  reservaForm = this.fb.group({
    // Cliente
    clienteDni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    clienteNombre: ['', [Validators.required, Validators.minLength(2)]],
    clienteApellido: ['', [Validators.required, Validators.minLength(2)]],
    clienteCorreo: ['', [Validators.required, Validators.email]],
    // Reserva
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    estado: ['', Validators.required],
    hotelId: ['', Validators.required],
  });

  estados = [
    { value: 'CONFIRMADA', label: 'Confirmada' },
    { value: 'CANCELADA', label: 'Cancelada' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.reservaId.set(Number(id));
      this.loadHoteles();
      this.loadReserva(Number(id));
    } else {
      this.router.navigate(['/admin/reserva/list']);
    }
  }

  loadHoteles(): void {
    this.hotelService.getAllHoteles().subscribe({
      next: (data) => {
        this.hoteles.set(data);
      },
      error: (err) => {
        console.error('Error cargando hoteles:', err);
      },
    });
  }

  loadReserva(id: number): void {
    this.loading.set(true);
    this.reservaService.getById(id).subscribe({
      next: (reserva) => {
        this.reserva.set(reserva);

        // Cargar datos en el formulario
        this.reservaForm.patchValue({
          clienteDni: reserva.cliente.dni,
          clienteNombre: reserva.cliente.nombre,
          clienteApellido: reserva.cliente.apellido,
          clienteCorreo: reserva.cliente.email,
          fechaInicio: reserva.fechaInicio,
          fechaFin: reserva.fechaFin,
          estado: reserva.estado,
          hotelId: String(reserva.hotel.id),
        });

        // Cargar habitaciones del hotel
        this.onHotelChange(reserva.hotel.id);

        // Marcar habitaciones seleccionadas
        const habitacionIds = reserva.detalles.map((d) => d.habitacion.id!);
        this.habitacionesSeleccionadas.set(habitacionIds);

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando reserva:', err);
        alert('No se pudo cargar la reserva');
        this.router.navigate(['/admin/reserva/list']);
      },
    });
  }

  onHotelChange(hotelId: number | string): void {
    const id = typeof hotelId === 'string' ? Number(hotelId) : hotelId;

    if (!id) {
      this.habitacionesDisponibles.set([]);
      return;
    }

    this.hotelService.getById(id).subscribe({
      next: (hotel) => {
        this.habitacionesDisponibles.set(hotel.habitaciones || []);
      },
      error: (err) => {
        console.error('Error cargando habitaciones:', err);
        this.habitacionesDisponibles.set([]);
      },
    });
  }

  onHotelSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const hotelId = Number(select.value);

    // Limpiar habitaciones seleccionadas al cambiar de hotel
    this.habitacionesSeleccionadas.set([]);
    this.onHotelChange(hotelId);
  }

  toggleHabitacion(habitacionId: number): void {
    const seleccionadas = this.habitacionesSeleccionadas();

    if (seleccionadas.includes(habitacionId)) {
      this.habitacionesSeleccionadas.set(seleccionadas.filter((id) => id !== habitacionId));
    } else {
      this.habitacionesSeleccionadas.set([...seleccionadas, habitacionId]);
    }
  }

  isHabitacionSeleccionada(habitacionId: number): boolean {
    return this.habitacionesSeleccionadas().includes(habitacionId);
  }

  calcularTotal(): number {
    const habitaciones = this.habitacionesDisponibles();
    const seleccionadas = this.habitacionesSeleccionadas();
    const fechaInicio = this.reservaForm.get('fechaInicio')?.value;
    const fechaFin = this.reservaForm.get('fechaFin')?.value;

    if (!fechaInicio || !fechaFin || seleccionadas.length === 0) {
      return 0;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const noches = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

    if (noches <= 0) return 0;

    const totalPorNoche = habitaciones
      .filter((h) => seleccionadas.includes(h.id!))
      .reduce((sum, h) => sum + h.precio, 0);

    return totalPorNoche * noches;
  }

  onSubmit(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    if (this.habitacionesSeleccionadas().length === 0) {
      alert('Debe seleccionar al menos una habitación');
      return;
    }

    const id = this.reservaId();
    if (!id) return;

    const formValue = this.reservaForm.getRawValue();

    // Validar fechas
    const fechaInicio = new Date(formValue.fechaInicio!);
    const fechaFin = new Date(formValue.fechaFin!);

    if (fechaFin <= fechaInicio) {
      alert('La fecha de salida debe ser posterior a la fecha de entrada');
      return;
    }

    const reservaData: ReservaAdminUpdateDTO = {
      fechaInicio: formValue.fechaInicio!,
      fechaFin: formValue.fechaFin!,
      estado: formValue.estado!,
      hotelId: Number(formValue.hotelId),
      cliente: {
        dni: formValue.clienteDni!,
        nombre: formValue.clienteNombre!,
        apellido: formValue.clienteApellido!,
        correo: formValue.clienteCorreo!,
      },
      habitaciones: this.habitacionesSeleccionadas(),
    };

    this.saving.set(true);

    this.reservaService.update(id, reservaData).subscribe({
      next: () => {
        alert('Reserva actualizada exitosamente');
        this.router.navigate(['/admin/reserva/list']);
      },
      error: (err) => {
        console.error('Error actualizando reserva:', err);
        alert('Error al actualizar la reserva');
        this.saving.set(false);
      },
    });
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  // Getters para validaciones
  get clienteDniInvalid(): boolean {
    const control = this.reservaForm.get('clienteDni');
    return !!(control?.invalid && control?.touched);
  }

  get clienteNombreInvalid(): boolean {
    const control = this.reservaForm.get('clienteNombre');
    return !!(control?.invalid && control?.touched);
  }

  get clienteApellidoInvalid(): boolean {
    const control = this.reservaForm.get('clienteApellido');
    return !!(control?.invalid && control?.touched);
  }

  get clienteCorreoInvalid(): boolean {
    const control = this.reservaForm.get('clienteCorreo');
    return !!(control?.invalid && control?.touched);
  }

  get fechaInicioInvalid(): boolean {
    const control = this.reservaForm.get('fechaInicio');
    return !!(control?.invalid && control?.touched);
  }

  get fechaFinInvalid(): boolean {
    const control = this.reservaForm.get('fechaFin');
    return !!(control?.invalid && control?.touched);
  }
}
