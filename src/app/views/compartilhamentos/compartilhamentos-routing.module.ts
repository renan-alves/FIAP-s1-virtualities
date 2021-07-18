import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompartilhamentosComponent } from './compartilhamentos.component';

const routes: Routes = [{ path: '', component: CompartilhamentosComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompartilhamentosRoutingModule { }
