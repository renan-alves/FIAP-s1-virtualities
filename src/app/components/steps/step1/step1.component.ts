import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IPlan } from 'src/app/interfaces/plan';
import { IUser } from 'src/app/interfaces/users';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.scss']
})
export class Step1Component implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  @Input('files') files: File[];
  @Input('plan') plan: IPlan;
  @Input('user') user: IUser;

  @Output() fileCallback: EventEmitter<File> = new EventEmitter();
  @Output() errorCallback: EventEmitter<string> = new EventEmitter();

  leftSize: string;
  error: boolean;
  anonymousDefaultSize: number = 536870912; //Melhorar depois
  anonymousDefaultUpload: number = 1;

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
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = 0;
    while (bytes >= 1024) {
      bytes /= 1024;
      ++i;
    }
    return Math.floor(bytes * 100) / 100 + ' ' + units[i];
  }

  getLeftSize(): void {
    this.error = false;

    const totalSize = this.files.reduce((acc, curr) => acc + curr.size, 0);
    console.log(totalSize);
    const usedSize = (this.plan ? this.plan.storageLimit : this.anonymousDefaultSize) -
      totalSize -
      (this.user ? this.user.storage : 0);
    this.leftSize = this.humanFileSize(usedSize);

    if (usedSize < 0) {
      this.leftSize = this.humanFileSize(usedSize * -1);
      this.error = true;
    }

    if ((this.user ? this.user.uploads : 0) >= (this.plan ? this.plan.uploadLimit : this.anonymousDefaultUpload))
      this.errorCallback.emit('Limite de uploads excedido!');
    else if (usedSize < 0)
      this.errorCallback.emit('Limite de tamanho excedido!');

    else
      this.errorCallback.emit(null);
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
    this.getLeftSize();
    if (this.files.length < 1)
      this.errorCallback.emit(null);
  }
}
