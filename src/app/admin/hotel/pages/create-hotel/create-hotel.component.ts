import { Router } from '@angular/router';
import { routes } from './../../../../app.routes';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartamentoResponse } from '../../../../interfaces/departamento/departamento-response.interface';
import { DepartamentoService } from '../../../services/departamento.service';
import { HotelService } from '../../../services/hotel.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-hotel.component',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-hotel.component.html',

})
export class CreateHotelPageComponent {

  private fb = inject(FormBuilder);
  private hotelService = inject(HotelService);
  private departamentoService = inject(DepartamentoService);

   router = inject(Router);

  departamentos = signal<DepartamentoResponse[]>([]);

  hotelForm = this.fb.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    departamentoId: ['', Validators.required]
  });

  constructor() {
    this.loadDepartamentos();

  }

  loadDepartamentos() {
    this.departamentoService.getAll().subscribe((data) => {
      this.departamentos.set(data);
    });
  }

  onSubmit() {
    if (this.hotelForm.invalid) return;

    const formValue = this.hotelForm.getRawValue();

    const hotelData = {
      ...formValue,
      nombre: formValue.nombre ?? '', // aunque me gustaria evitar esto luego
      direccion: formValue.direccion ?? '', // x2
      departamentoId: Number(formValue.departamentoId),
      habitaciones: [] // xq en la creacion no se agregaran habitaciones, en el update sí
    };

    this.hotelService.createHotel(hotelData).subscribe({
      next: () => {
        alert("Hotel creado :DDD");
        this.hotelForm.reset();
        this.router.navigate(['/admin/hotel/list'])

      },
      error: (err) => console.log(err)
    });
  }
}
