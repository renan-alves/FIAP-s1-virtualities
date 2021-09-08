import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlanosComponent } from './planos.component';

const routes: Routes = [{ path: '', component: PlanosComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanosRoutingModule { }
