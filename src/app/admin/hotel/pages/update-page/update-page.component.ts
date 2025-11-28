import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { TipoHabitacionService } from '../../../services/tipo-habitacion.service';
import { DepartamentoService } from '../../../services/departamento.service';
import { forkJoin } from 'rxjs';
import { TipoHabitacionResponse } from '../../../../interfaces/tipo-habitacion/tipo-habitacion-response.interface';

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  templateUrl: './update-page.component.html',
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class UpdateHotelFormComponent implements OnInit {
  hotelForm!: FormGroup;


  tiposHabitacion = signal<TipoHabitacionResponse[]>([]);
  departamentos = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  hotelId!: number;

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private tipoHabitacionService: TipoHabitacionService,
    private departamentoService: DepartamentoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.hotelId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.hotelId || isNaN(this.hotelId)) {
      this.error.set('ID de hotel inválido');
      this.loading.set(false);
      return;
    }

    this.initForm();
    this.loadData();
  }

  initForm() {
    this.hotelForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      departamento: ['', Validators.required],
      habitaciones: this.fb.array([])
    });
  }

  get habitaciones(): FormArray {
    return this.hotelForm.get('habitaciones') as FormArray;
  }

  nuevaHabitacion(hab?: any): FormGroup {
    return this.fb.group({
      id: [hab?.id || null],
      numero: [hab?.numero || '', Validators.required],
      estado: [hab?.estado || 'DISPONIBLE', Validators.required],
      precio: [hab?.precio || 0, [Validators.required, Validators.min(0)]],
      tipoHabitacion: [hab?.tipoHabitacion?.id ?? null, Validators.required]
    });
  }

  addHabitacion(hab?: any) {
    this.habitaciones.push(this.nuevaHabitacion(hab));
  }

  removeHabitacion(i: number) {
    if (confirm('¿Estás seguro de eliminar esta habitación?')) {
      this.habitaciones.removeAt(i);
    }
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      tipos: this.tipoHabitacionService.getAll(),
      departamentos: this.departamentoService.getAll(),
      hotel: this.hotelService.getById(this.hotelId)
    }).subscribe({
      next: ({ tipos, departamentos, hotel }) => {
        console.log('Datos cargados:', { tipos, departamentos, hotel });


        this.tiposHabitacion.set(tipos);
        this.departamentos.set(departamentos);


        this.hotelForm.patchValue({
          nombre: hotel.nombre,
          direccion: hotel.direccion,
          departamento: hotel.departamento?.id || ''
        });

        // Limpiar habitaciones
        while (this.habitaciones.length > 0) {
          this.habitaciones.removeAt(0);
        }


        if (hotel.habitaciones && hotel.habitaciones.length > 0) {
          hotel.habitaciones.forEach((hab: any) => {
            this.addHabitacion(hab);
          });
        }


        this.loading.set(false);
        console.log('Formulario cargado:', this.hotelForm.value);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);

        let errorMsg = 'Error al cargar los datos';
        if (err.status === 404) {
          errorMsg = 'Hotel no encontrado';
        } else if (err.status === 403) {
          errorMsg = 'No tienes permisos para acceder a este hotel';
        } else if (err.status === 0) {
          errorMsg = 'No se puede conectar con el servidor';
        }

        this.error.set(errorMsg);
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.hotelForm.invalid) {
      alert('Por favor completa todos los campos requeridos');
      this.hotelForm.markAllAsTouched();
      return;
    }

    const payload = {
      nombre: this.hotelForm.value.nombre,
      direccion: this.hotelForm.value.direccion,
      departamentoId: Number(this.hotelForm.value.departamento),
      habitaciones: this.hotelForm.value.habitaciones.map((hab: any) => ({
        ...(hab.id ? { id: hab.id } : {}),
        numero: hab.numero,
        estado: hab.estado,
        precio: hab.precio,
        tipoHabitacionId: Number(hab.tipoHabitacion)
      }))
    };

    console.log('Payload a enviar:', payload);

    this.hotelService.updateHotel(this.hotelId, payload).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        alert('Hotel actualizado correctamente');
        this.router.navigate(['/admin/hotel/list']);
      },
      error: (err) => {
        console.error('Error al guardar:', err);

        let errorMsg = 'Error desconocido';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        } else if (err.status === 400) {
          errorMsg = 'Datos inválidos';
        } else if (err.status === 403) {
          errorMsg = 'No tienes permisos para actualizar este hotel';
        }

        alert('Error al guardar el hotel: ' + errorMsg);
      }
    });
  }
}
