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
  }

  humanFileSize(bytes: number, dp = 1) {
    const thresh = 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    const r = 10 ** dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + ' ' + units[u];
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
  }
}
