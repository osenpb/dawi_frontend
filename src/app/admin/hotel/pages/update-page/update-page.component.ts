import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { TipoHabitacionService } from '../../../services/tipo-habitacion.service';
import { DepartamentoService } from '../../../services/departamento.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  templateUrl: './update-page.component.html',
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class UpdateHotelFormComponent implements OnInit {
  hotelForm!: FormGroup;
  tiposHabitacion: any[] = [];
  departamentos: any[] = [];

  loading = true;
  error: string | null = null;
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
    // Obtener ID desde la ruta
    this.hotelId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.hotelId || isNaN(this.hotelId)) {
      this.error = 'ID de hotel inválido';
      this.loading = false;
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

  // ===========================
  // CARGA DE DATOS CON FORKJOIN
  // ===========================
  loadData() {
    this.loading = true;
    this.error = null;

    // Cargar TODOS los datos en paralelo
    forkJoin({
      tipos: this.tipoHabitacionService.getAll(),
      departamentos: this.departamentoService.getAll(),
      hotel: this.hotelService.getById(this.hotelId)
    }).subscribe({
      next: ({ tipos, departamentos, hotel }) => {
        console.log('Datos cargados:', { tipos, departamentos, hotel });

        // Asignar datos a las propiedades
        this.tiposHabitacion = tipos;
        this.departamentos = departamentos;

        // Rellenar el formulario con los datos del hotel
        this.hotelForm.patchValue({
          nombre: hotel.nombre,
          direccion: hotel.direccion,
          departamento: hotel.departamento?.id || ''
        });

        // Limpiar habitaciones existentes
        while (this.habitaciones.length > 0) {
          this.habitaciones.removeAt(0);
        }

        // Agregar habitaciones del hotel
        if (hotel.habitaciones && hotel.habitaciones.length > 0) {
          hotel.habitaciones.forEach((hab: any) => {
            this.addHabitacion(hab);
          });
        }

        this.loading = false;
        console.log('Formulario cargado:', this.hotelForm.value);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);

        // Mensajes de error más específicos
        if (err.status === 404) {
          this.error = 'Hotel no encontrado';
        } else if (err.status === 403) {
          this.error = 'No tienes permisos para acceder a este hotel';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que esté ejecutándose.';
        } else {
          this.error = 'Error al cargar los datos. Revisa la consola para más detalles.';
        }

        this.loading = false;
      }
    });
  }

  // ===========================
  // GUARDAR CAMBIOS
  // ===========================
  onSubmit() {
    if (this.hotelForm.invalid) {
      alert('Por favor completa todos los campos requeridos');
      this.hotelForm.markAllAsTouched();
      return;
    }

    // Construir payload con la estructura correcta
    const payload = {
      nombre: this.hotelForm.value.nombre,
      direccion: this.hotelForm.value.direccion,
      departamentoId: Number(this.hotelForm.value.departamento),
      habitaciones: this.hotelForm.value.habitaciones.map((hab: any) => ({
        ...(hab.id ? { id: hab.id } : {}), // Solo incluir ID si existe (para updates)
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
        this.router.navigate(['/hoteles']);
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
