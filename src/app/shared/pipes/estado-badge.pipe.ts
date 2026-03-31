import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estadoBadge', standalone: true })
export class EstadoBadgePipe implements PipeTransform {
  private classes: Record<string, string> = {
    CONFIRMADA: 'bg-green-100 text-green-800',
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    CANCELADA: 'bg-red-100 text-red-800',
  };

  transform(estado: string): string {
    return this.classes[estado] ?? 'bg-gray-100 text-gray-800';
  }
}
