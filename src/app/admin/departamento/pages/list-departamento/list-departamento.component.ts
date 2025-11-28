import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DepartamentoResponse } from '../../../../interfaces/departamento/departamento-response.interface';
import { DepartamentoService } from '../../../services/departamento.service';

@Component({
  standalone: true,
  selector: 'app-list-departamento',
  imports: [CommonModule, RouterLink],
  templateUrl: './list-departamento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListDepartamentoComponent {
  private departamentoService = inject(DepartamentoService);

  departamentos = signal<DepartamentoResponse[]>([]);
  loading = signal<boolean>(true);

  constructor() {
    this.loadDepartamentos();
  }

  loadDepartamentos(): void {
    this.loading.set(true);
    this.departamentoService.getAll().subscribe({
      next: (data) => {
        this.departamentos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando departamentos', err);
        this.loading.set(false);
      },
    });
  }

  eliminarDepartamento(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este departamento?')) {
      this.departamentoService.delete(id).subscribe({
        next: () => {
          this.loadDepartamentos();
        },
        error: (err) => {
          console.error('Error eliminando departamento', err);
          alert('No se pudo eliminar el departamento. Puede tener hoteles asociados.');
        },
      });
    }
  }
}
