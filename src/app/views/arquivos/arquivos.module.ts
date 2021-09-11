import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArquivosRoutingModule } from './arquivos-routing.module';
import { ArquivosComponent } from './arquivos.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoaderComponent } from 'src/app/components/loader/loader.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/components/modal/modal.component';

@NgModule({
  declarations: [ArquivosComponent, LoaderComponent, ModalComponent],
  imports: [
    CommonModule,
    ArquivosRoutingModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    FontAwesomeModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ]
})
export class ArquivosModule { }
