import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-hoteles-por-departamento',
  imports: [],
  templateUrl: './hoteles-por-departamento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelesPorDepartamentoComponent { }
