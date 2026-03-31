import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HotelResponse } from '../../interfaces';

@Component({
  selector: 'app-card-hotel',
  imports: [],
  templateUrl: './card-hotel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHotelComponent {

  hotel = input<HotelResponse | null>(null);


}


