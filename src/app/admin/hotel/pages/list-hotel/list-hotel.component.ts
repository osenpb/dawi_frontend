import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelResponse } from '../../../../interfaces/hotel/hotel-response.interface';
import { HotelService } from '../../../services/hotel.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-list-hotel',
  imports: [CommonModule, RouterLink],
  templateUrl: './list-hotel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHotelPageComponent {
  private hotelService = inject(HotelService);

  hoteles = signal<HotelResponse[]>([]);

  constructor() {
    this.loadAllHoteles();
  }

  loadAllHoteles() {
    this.hotelService.getAllHoteles().subscribe({
      next: (data) => this.hoteles.set(data),
      error: (err) => console.error('Error cargando hoteles', err),
    });
  }

  eliminarHotelPorId(id: number) {
    if (confirm('¿Seguro que quieres eliminar el hotel?')) {
      this.hotelService.deleteById(id).subscribe({
        next: () => this.loadAllHoteles(),
        error: (err) => console.log(err),
      });
    }
  }
}
