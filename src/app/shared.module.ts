import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './components/modal/modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
    imports: [
        CommonModule,        
        MatDialogModule,    
     ],
    declarations: [
      ModalComponent
    ],
    exports: [
      ModalComponent
    ]
})
export class SharedModule {}