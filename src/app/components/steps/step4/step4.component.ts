import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrls: ['./step4.component.scss']
})
export class Step4Component implements OnInit, OnDestroy {
  @Output() limitCallback: EventEmitter<{expirationDate: number, downloadLimit: number}> = new EventEmitter();

  expirationDate = new FormControl();
  downloadLimit = new FormControl();

  constructor() { }

  ngOnDestroy(): void {
    this.limitCallback.emit({
      expirationDate: Date.parse(this.expirationDate.value),
      downloadLimit: this.downloadLimit.value
    })
  }

  ngOnInit(): void {
  }

}
