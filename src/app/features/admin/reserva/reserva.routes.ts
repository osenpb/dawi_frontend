import { EditReservaPageComponent } from './pages/edit-reserva/edit-reserva.component';
import { ListReservaPageComponent } from './pages/list-reserva/list-reserva.component';
import { Routes } from '@angular/router';

export const reservaRoutes: Routes = [
  {
    path: 'list',
    component: ListReservaPageComponent,
  },
  {
    path: 'editar/:id',
    component: EditReservaPageComponent,
  },
];

export default reservaRoutes;
