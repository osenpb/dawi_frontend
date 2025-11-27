import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardPageComponent,
      },
      {
        path: 'hotel',
        loadChildren: () => import('./hotel/hotel.routes').then((m) => m.hotelAdminRoutes),
      },
      {
        path: 'departamento',
        loadChildren: () => import('./departamento/departamento.routes').then((m) => m.departamentoRoutes),
      },
      {
        path: 'reserva',
        loadChildren: () => import('./reserva/reserva.routes').then((m) => m.reservaRoutes),
      },
    ],
  },
];

export default adminRoutes;
