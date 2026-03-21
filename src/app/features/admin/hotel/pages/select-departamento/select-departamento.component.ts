import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DepartamentoService } from '../../../../../services/departamento.service';
import { DepartamentoResponse } from '../../../../../interfaces';
import { LoggerService } from '../../../../../core/services/logger.service';


@Component({
  standalone: true,
  selector: 'app-select-departamento',
  imports: [CommonModule, RouterLink],
  templateUrl: './select-departamento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDepartamentoHotelComponent implements OnInit {
  private departamentoService = inject(DepartamentoService);
  private logger = inject(LoggerService);

  departamentos = signal<DepartamentoResponse[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
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
        this.logger.error('Error cargando departamentos:', err);
        this.loading.set(false);
      }
    });
  }
}




