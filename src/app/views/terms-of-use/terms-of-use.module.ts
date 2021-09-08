import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TermsOfUseRoutingModule } from './terms-of-use-routing.module';
import { TermsOfUseComponent } from './terms-of-use.component';


@NgModule({
  declarations: [TermsOfUseComponent],
  imports: [
    CommonModule,
    TermsOfUseRoutingModule
  ]
})
export class TermsOfUseModule { }
