import { Routes } from "@angular/router";
import { ListHotelComponent } from "./pages/list-hotel/list-hotel.component";
import { CreateHotelComponent } from "./pages/create-hotel/create-hotel.component";

export const hotelAdminRoutes: Routes = [
  {
    path: 'list',
    component: ListHotelComponent
  },
  {
    path: 'crear',
    component: CreateHotelComponent

  }
]

export default hotelAdminRoutes;
