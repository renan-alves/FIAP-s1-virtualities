import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss']
})
export class Step1Component implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  @Input('files') files: File[];

  @Output() fileCallback: EventEmitter<File> = new EventEmitter();

  freePlanSize = 5368709120
  leftSize: string;

  constructor() { }

  ngOnInit(): void {
  }

  openFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: { target: { files: File[]; }; }): void {
    Object.values(event.target.files).forEach(file => {
      this.fileCallback.emit(file)
    });
    this.getLeftSize();
  }

  humanFileSize(bytes: number) {


    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = 0;
    while (bytes >= 1024) {
      bytes /= 1024;
      ++i;
    }
    return Math.floor(bytes * 100) / 100 + ' ' + units[i];
  }

  getLeftSize() {
    const totalSize = this.files.reduce((acc, curr) => acc + curr.size, 0);
    this.leftSize = this.humanFileSize(this.freePlanSize - totalSize);
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
  }
}
