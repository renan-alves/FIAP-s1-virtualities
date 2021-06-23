import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss']
})
export class Step2Component implements OnInit, OnDestroy {
  @Output() passwordCallback: EventEmitter<{requirePassword: boolean, password: string}> = new EventEmitter();

  password = new FormControl('');
  requirePassword = new FormControl(true);

  toggle: boolean;

  constructor() { }

  ngOnDestroy(): void {
    this.passwordCallback.emit({
      requirePassword: this.requirePassword.value,
      password: this.password.value
    });
  }

  ngOnInit(): void {
  }

  generateRandomPassword(): void { }

  toggleForm(): void {
    this.toggle = !this.toggle;
    if(this.toggle) 
      this.password.disable();
    else 
      this.password.enable();
  }

}
