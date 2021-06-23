import { Component, Input, OnInit } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.scss']
})
export class Step5Component implements OnInit {
  @Input('progress$') progress$: Observable<number>;
  @Input('uploaded') uploaded: boolean;

  constructor() { }

  ngOnInit(): void {
  }
}
