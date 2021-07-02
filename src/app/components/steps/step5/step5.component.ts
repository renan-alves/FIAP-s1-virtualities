import { Component, Input, OnInit } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.scss']
})
export class Step5Component implements OnInit {
  @Input('progress$') progress$: Observable<number>;
  @Input('uploaded') uploaded: boolean;
  @Input('id') id: boolean;
  @Input('expireIn') expireIn: number;

  link = new FormControl();

  constructor() { }

  ngOnInit(): void {
    this.link.setValue(window.location.href + 'download/' + this.id);
  }
}
