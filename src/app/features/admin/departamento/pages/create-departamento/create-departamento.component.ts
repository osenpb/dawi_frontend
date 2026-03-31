import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DepartamentoService } from '../../../../../services/departamento.service';
import { LoggerService } from '../../../../../core/services/logger.service';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-create-departamento',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-departamento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDepartamentoPageComponent {
  private fb = inject(FormBuilder);
  private departamentoService = inject(DepartamentoService);
  private router = inject(Router);
  private logger = inject(LoggerService);
  private notification = inject(NotificationService);

  saving = signal<boolean>(false);

  departamentoForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    detalle: ['', [Validators.required, Validators.minLength(5)]],
  });

  onSubmit(): void {
    if (this.departamentoForm.invalid) {
      this.departamentoForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.departamentoForm.getRawValue();

    const departamentoData = {
      nombre: formValue.nombre ?? '',
      detalle: formValue.detalle ?? '',
    };

    this.departamentoService.create(departamentoData).subscribe({
      next: () => {
        this.notification.success('Departamento creado exitosamente');
        this.router.navigate(['/admin/departamento/list']);
      },
      error: (err) => {
        this.logger.error('Error al crear departamento:', err);
        this.notification.error('Error al crear el departamento');
        this.saving.set(false);
      },
    });
  }

  // Getters para validaciones en el template
  get nombreInvalid(): boolean {
    const control = this.departamentoForm.get('nombre');
    return !!(control?.invalid && control?.touched);
  }

  get detalleInvalid(): boolean {
    const control = this.departamentoForm.get('detalle');
    return !!(control?.invalid && control?.touched);
  }
}




