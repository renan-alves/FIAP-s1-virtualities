import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IPlan } from 'src/app/interfaces/plan';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss']
})
export class Step2Component implements OnInit, OnDestroy {

  @Input('plan') plan: IPlan;

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

  defaultDownloadLimit: number = 3;
  defaultExpirationDays: number = 1;

  constructor() { }

  ngOnDestroy(): void {
    const date = new Date(Date.parse(this.expirationDate.value));
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(999);

    this.securityCallback.emit({
      requirePassword: this.requirePassword.value,
      password: this.password.value,
      expirationDate: date.getTime(),
      downloadLimit: this.downloadLimit.value
    });
  }

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    if (!this.plan?.canSetExpirationDate) {
      const date = new Date;
      this.expirationDate.setValue(formatDate(
        date.setDate(date.getDate() + (this.plan ? this.plan.defaultExpirationDays : this.defaultExpirationDays)),
        'yyyy-MM-dd',
        'en'
      ));
      this.expirationDate.disable();
    }

    if (!this.plan?.canSetDownloadLimit) {
      this.downloadLimit.setValue(this.plan ? this.plan.defaultDownloadLimit: this.defaultDownloadLimit);
      this.downloadLimit.disable();
    }
  }

  toggleForm(): void {
    this.toggle = !this.toggle;
    if (this.toggle){
      this.password.disable();
      this.password.setValue('');
    }
    else
      this.password.enable();
  }
}