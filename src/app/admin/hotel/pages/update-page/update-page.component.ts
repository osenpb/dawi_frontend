import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../../services/hotel.service';
import { TipoHabitacionService } from '../../../services/tipo-habitacion.service';
import { DepartamentoService } from '../../../services/departamento.service';

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  templateUrl: './update-page.component.html',
  imports: [ReactiveFormsModule, CommonModule]
})
export class UpdateHotelFormComponent implements OnInit {
  hotelForm!: FormGroup;
  tiposHabitacion: any[] = [];
  departamentos: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private tipoHabitacionService: TipoHabitacionService,
    private departamentoService: DepartamentoService
  ) {}

  ngOnInit(): void {
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

  loadData() {
    this.loading = true;
    this.error = null;

    // Cargar tipos de habitación
    this.tipoHabitacionService.getAll().subscribe({
      next: (res) => this.tiposHabitacion = res,
      error: (err) => {
        console.error('Error al cargar tipos de habitación:', err);
        this.error = 'Error al cargar tipos de habitación';
      }
    });

    // Cargar departamentos
    this.departamentoService.getAll().subscribe({
      next: (res) => this.departamentos = res,
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
        this.error = 'Error al cargar departamentos';
      }
    });

    // Cargar hotel por ID
    this.hotelService.getById(1).subscribe({
      next: (hotel) => {
        this.hotelForm.patchValue({
          nombre: hotel.nombre,
          direccion: hotel.direccion,
          departamento: hotel.departamento?.id || ''
        });

        // Limpiar habitaciones existentes
        while (this.habitaciones.length > 0) {
          this.habitaciones.removeAt(0);
        }

        // Añadir habitaciones del hotel
        if (hotel.habitaciones && hotel.habitaciones.length > 0) {
          hotel.habitaciones.forEach((hab: any) => this.addHabitacion(hab));
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar hotel:', err);
        this.error = 'Error al cargar el hotel. Verifica tu autenticación.';
        this.loading = false;
      }
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
      tipoHabitacion: [hab?.tipoHabitacion?.id || '', Validators.required]
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

  onSubmit() {
    if (this.hotelForm.invalid) {
      alert('Por favor completa todos los campos requeridos');
      this.hotelForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.hotelForm.value,
      habitaciones: this.hotelForm.value.habitaciones.map((hab: any) => ({
        ...hab,
        tipoHabitacion: { id: hab.tipoHabitacion }
      }))
    };

    this.hotelService.updateHotel(payload).subscribe({
      next: () => {
        alert('Hotel actualizado correctamente');
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Error al guardar el hotel: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }
}
