import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignUpRoutingModule } from './sign-up-routing.module';
import { SignUpComponent } from './sign-up.component';
import { SignUpFormComponent } from 'src/app/components/auth/sign-up/sign-up.component';


@NgModule({
  declarations: [
    SignUpComponent,
    SignUpFormComponent
  ],
  imports: [
    CommonModule,
    SignUpRoutingModule
  ]
})
export class SignUpModule { }
