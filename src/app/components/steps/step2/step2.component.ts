import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss']
})
export class Step2Component implements OnInit, OnDestroy {
  @Output() securityCallback: EventEmitter<{
    requirePassword: boolean,
    password: string,
    expirationDate: number,
    downloadLimit: number
  }> = new EventEmitter();

  password = new FormControl('');
  requirePassword = new FormControl(true);
  expirationDate = new FormControl();
  downloadLimit = new FormControl();

  toggle: boolean;

  constructor() { }

  ngOnDestroy(): void {
    this.securityCallback.emit({
      requirePassword: this.requirePassword.value,
      password: this.password.value,
      expirationDate: Date.parse(this.expirationDate.value),
      downloadLimit: this.downloadLimit.value
    });
  }

  ngOnInit(): void {
  }

  toggleForm(): void {
    this.toggle = !this.toggle;
    if (this.toggle)
      this.password.disable();
    else
      this.password.enable();
  }
}