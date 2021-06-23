import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss']
})
export class Step3Component implements OnInit, OnDestroy {
  @Output() anonymousCallback: EventEmitter<{allowAnonymous: boolean}> = new EventEmitter();

  allowAnonymous = new FormControl(true);

  constructor() { }
  ngOnDestroy(): void {
    this.anonymousCallback.emit({
      allowAnonymous: this.allowAnonymous.value
    })
  }

  ngOnInit(): void {
  }

}
