import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { DepartamentosPageComponent } from './pages/departamentos-page/departamentos-page.component';
import { HotelesPageComponent } from './pages/hoteles-page/hoteles-page.component';
import { ReservaPageComponent } from './pages/reserva-page/reserva-page.component';
import { ConfirmacionPageComponent } from './pages/confirmacion-page/confirmacion-page.component';
import { MisReservasPageComponent } from './pages/mis-reservas-page/mis-reservas-page.component';
import { ClienteLayoutComponent } from './layout/cliente-layout/cliente-layout.component';

export const homeRoutes: Routes = [
  {
    path: '',
    component: ClienteLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent,
      },
      {
        path: 'hoteles',
        component: HotelesPageComponent,
      },
      {
        path: 'departamentos',
        component: DepartamentosPageComponent,
      },
      {
        path: 'hoteles/:depId',
        component: HotelesPageComponent,
      },
      {
        path: 'hotel/:hotelId/reservar',
        component: ReservaPageComponent,
      },
      {
        path: 'reserva/:reservaId/confirmacion',
        component: ConfirmacionPageComponent,
      },
      {
        path: 'mis-reservas',
        component: MisReservasPageComponent,
      },
    ]
  }
];

export default homeRoutes;
