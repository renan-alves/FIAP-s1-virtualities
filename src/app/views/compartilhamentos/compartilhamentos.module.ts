import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CompartilhamentosRoutingModule } from './compartilhamentos-routing.module';
import { CompartilhamentosComponent } from './compartilhamentos.component';


@NgModule({
  declarations: [CompartilhamentosComponent],
  imports: [
    CommonModule,
    CompartilhamentosRoutingModule
  ]
})
export class CompartilhamentosModule {
}

