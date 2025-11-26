
import { Routes } from "@angular/router";

import { UpdateHotelFormComponent } from "./pages/update-page/update-page.component";
import { ListHotelPageComponent } from "./pages/list-hotel/list-hotel.component";
import { CreateHotelPageComponent } from "./pages/create-hotel/create-hotel.component";

export const hotelAdminRoutes: Routes = [
  {
    path: 'list',
    component: ListHotelPageComponent
  },
  {
    path: 'crear',
    component: CreateHotelPageComponent

  },
  {
    path: 'editar/:id',
    component: UpdateHotelFormComponent
  }
]

export default hotelAdminRoutes;
