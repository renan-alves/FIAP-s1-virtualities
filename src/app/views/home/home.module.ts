import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { StepperComponent } from 'src/app/components/stepper/stepper.component';
import { Step1Component } from 'src/app/components/steps/step1/step1.component';
import { Step2Component } from 'src/app/components/steps/step2/step2.component';
import { Step3Component } from 'src/app/components/steps/step3/step3.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxFileDropModule } from 'ngx-file-drop';

@NgModule({
  declarations: [
    HomeComponent,
    StepperComponent,
    Step1Component,
    Step2Component,
    Step3Component
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgbProgressbarModule,
    HttpClientModule,
    NgxFileDropModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeModule { }
