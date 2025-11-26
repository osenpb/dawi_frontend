import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hotel } from '../../../interfaces/hotel.interface';
import { HotelService } from '../../../services/hotel.service';
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  selector: 'app-list-hotel',
  imports: [CommonModule, RouterLink],
  templateUrl: './list-hotel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHotelPageComponent {

  private hotelService = inject(HotelService);

  hoteles = signal<Hotel[]>([]);

  constructor() {
    this.loadAllHoteles();
  }

  loadAllHoteles() {
    this.hotelService.getAllHoteles().subscribe({
      next: (data) => this.hoteles.set(data),
      error: (err) => console.error('Error cargando hoteles', err)
    });
  }

  eliminarHotelPorId(id: number) {
    this.hotelService.deleteById(id).subscribe({
      next: () => {
        alert('Seguro que quieres eliminar el hotel?')
        this.loadAllHoteles()
      },
      error: err => console.log(err)
    })
  }
}
