import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss']
})
export class Step3Component implements OnInit, OnDestroy {

  @Input('progress') progress: { file: File, progress: Observable<number> }[];
  @Input('uploaded') uploaded: boolean;
  @Input('id') id: boolean;
  @Input('expireIn') expireIn: number;

  link = new FormControl();

  constructor() { }
  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.link.setValue(window.location.href + 'download/' + this.id);
  }
}
