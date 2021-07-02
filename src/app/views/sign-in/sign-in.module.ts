import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignInRoutingModule } from './sign-in-routing.module';
import { SignInComponent } from './sign-in.component';
import { SignInFormComponent } from 'src/app/components/auth/sign-in/sign-in.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SignInComponent,
    SignInFormComponent
  ],
  imports: [
    CommonModule,
    SignInRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class SignInModule { }
