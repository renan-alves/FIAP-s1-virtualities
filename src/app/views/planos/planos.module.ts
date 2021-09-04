import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanosRoutingModule } from './planos-routing.module';
import { PlanosComponent } from './planos.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [PlanosComponent],
  imports: [
    CommonModule,
    PlanosRoutingModule,
    FontAwesomeModule
  ]
})
export class PlanosModule { }
