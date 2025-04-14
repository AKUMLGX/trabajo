import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DictaminadorPageComponent } from './pages/dictaminador-page/dictaminador-page.component';

const routes: Routes = [
  {
    path: 'dictaminador',
    component: DictaminadorPageComponent
  },
  {
    path: 'dictaminador/detalle/:id',
    component: DictaminadorPageComponent // Aquí podrías crear un componente específico para el detalle
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssistanceRoutingModule { } 