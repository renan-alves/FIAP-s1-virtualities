import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
  @Input('show') show: boolean;
  @Input('fullScreen') fullScreen: boolean;

  constructor() {
    this.show = false;
    this.fullScreen = true;
  }

  ngOnInit() {
    //this._show = false;
  }

}
