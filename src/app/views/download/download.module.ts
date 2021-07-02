import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DownloadRoutingModule } from './download-routing.module';
import { DownloadComponent } from './download.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [DownloadComponent],
  imports: [
    CommonModule,
    DownloadRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DownloadModule { }
