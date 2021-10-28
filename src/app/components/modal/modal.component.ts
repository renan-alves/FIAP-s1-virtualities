import { Component, EventEmitter, Inject, OnInit, Output, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Output() userAction: EventEmitter<boolean> = new EventEmitter();

  constructor(@Inject(MAT_DIALOG_DATA) public data: ModalData) { }

  ngOnInit() {
  }

  modalResult(result: boolean) {
    this.userAction.emit(result);
  }
}

export interface ModalData {
  templateHeader: TemplateRef<any>;
  templateBody: TemplateRef<any>;
}