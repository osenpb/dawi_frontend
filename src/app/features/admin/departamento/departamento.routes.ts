import { Routes } from '@angular/router';
import { ListDepartamentoPageComponent } from './pages/list-departamento/list-departamento.component';
import { CreateDepartamentoPageComponent } from './pages/create-departamento/create-departamento.component';
import { EditDepartamentoPageComponent } from './pages/edit-departamento/edit-departamento.component';

export const departamentoRoutes: Routes = [
  {
    path: 'list',
    component: ListDepartamentoPageComponent,
  },
  {
    path: 'crear',
    component: CreateDepartamentoPageComponent,
  },
  {
    path: 'editar/:id',
    component: EditDepartamentoPageComponent,
  },
];

export default departamentoRoutes;
