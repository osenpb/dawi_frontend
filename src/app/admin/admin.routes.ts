import { Routes } from "@angular/router";
import { AdminLayoutComponent } from "./layout/admin-layout/admin-layout.component";
import { DashboardPageComponent } from "./pages/dashboard-page/dashboard-page.component";

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardPageComponent // esta sera una pagina x defecto, podria mostrar estadisticas
      },
    ]
  }
]

export default adminRoutes;
