import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import * as JSZip from 'jszip';
import { Observable } from 'rxjs';
import { IFiles } from 'src/app/interfaces/files';
import { FilessService } from 'src/app/services/files/files.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  preventBodyDrop: boolean = false;
  active: boolean = false;

  files: File[] = [];
  step: number = 1;
  buttonText: string = 'Ok, próximo';
  progress$: Observable<number>;

  password: string;
  requirePassword: boolean;
  isAnonymous: boolean;
  downloadLimit: number;
  expirationDate: string;

  constructor(private afStorage: AngularFireStorage,
    private filesService: FilessService) { }

  ngOnInit(): void {
  }

  async generateLink() {
    const filename = await this.saveFilesData();
    await this.uploadFiles(filename);
  }

  async saveFilesData(): Promise<string> {
    const docId = this.filesService.createFirestoreId();
    const files: IFiles = {
      active: true,
      dateCreated: Date.now(),
      docId,
      downloadLimit: this.downloadLimit,
      expirationDate: Date.parse(this.expirationDate),
      isAnonymous: this.isAnonymous,
      requirePassword: this.requirePassword
    }

    if (this.requirePassword)
      files.password = CryptoJS.AES.encrypt(this.password, 'p31xE').toString();

    this.filesService.create$(files, docId);

    return docId;
  }

  async uploadFiles(filename: string): Promise<void> {
    let fileToUpload: File;
    if (this.files.length > 1) {
      let zip = new JSZip();

      for (let file of this.files) {
        let filename = file.name
        zip.file(filename, file)
      }

      await zip.generateAsync({ type: 'blob' }).then((blobdata) => {
        fileToUpload = new File([blobdata], filename + ".zip");
      });
    }
    else fileToUpload = this.files[0];

    const task = this.afStorage.upload('/' + filename, fileToUpload);
    this.progress$ = task.percentageChanges();
  }

  getPassword() {
    this.password = (document.getElementById("password") as HTMLInputElement).value;
    this.requirePassword = (document.getElementById("requirePassword") as HTMLInputElement).checked;
  }

  getFileParams() {
    this.downloadLimit = +(document.getElementById("downloadLimit") as HTMLInputElement).value;
    this.expirationDate = (document.getElementById("expirationDate") as HTMLInputElement).value;
  }

  getAnonymousParams() {
    this.isAnonymous = (document.getElementById("isAnonymous") as HTMLInputElement).checked;
  }

  nextStep() {
    this.step++;
    switch (this.step) {
      case 1: this.buttonText = 'Ok, próximo'; break;
      case 2: this.buttonText = 'Próximo'; break;
      case 3: this.getPassword(); this.buttonText = 'Próximo'; break;
      case 4: this.getAnonymousParams(); this.buttonText = 'Criar link'; break;
      case 5: this.getFileParams(); this.generateLink(); break;
    }
  }

  openFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: { target: { files: File[]; }; }): void {
    Object.values(event.target.files).forEach(file => {
      this.files.push(file);
    });
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.active = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    if (event.clientX < 1 && event.clientY < 1)
      this.active = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.active = false;

    const { dataTransfer } = event;

    if (dataTransfer.items) {
      for (let i = 0; i < dataTransfer.items.length; i++) {
        if (dataTransfer.items[i].kind === 'file') {
          this.files.push(dataTransfer.items[i].getAsFile());
        }
      }
      dataTransfer.items.clear();
    }
  }

  @HostListener('body:dragover', ['$event'])
  onBodyDragOver(event: DragEvent) {
    if (this.preventBodyDrop) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  @HostListener('body:drop', ['$event'])
  onBodyDrop(event: DragEvent) {
    if (this.preventBodyDrop) {
      event.preventDefault();
    }
  }
}