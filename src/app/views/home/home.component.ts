import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import JSZip from 'jszip';
import { Observable } from 'rxjs';
import { IFiles } from 'src/app/interfaces/files';
import { FilessService } from 'src/app/services/files/files.service';
import * as CryptoJS from 'crypto-js';
import * as stepMessages from '../../../assets/texts/stepsMessages.json';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  preventBodyDrop: boolean = false;
  active: boolean = false;

  files: File[] = [];
  step: number = 1;
  buttonText: string = 'Ok, próximo';
  stepMessages: string[];
  progress$: Observable<number>;
  uploaded: boolean;

  password: string;
  requirePassword: boolean;
  isAnonymous: boolean;
  downloadLimit: number;
  expirationDate: number;

  constructor(
    private afStorage: AngularFireStorage,
    private filesService: FilessService,
    private config: NgbProgressbarConfig,
    private httpClient: HttpClient) {
  }

  ngOnInit(): void {
    this.stepMessages = stepMessages.messages;
    this.config.max = 100;
    this.config.striped = true;
    this.config.animated = true;
    this.config.type = 'primary';
    this.config.height = '20px';
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
      expirationDate: this.expirationDate,
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
    let path: string;
    if (this.files.length > 1) {
      let zip = new JSZip();

      for (let file of this.files) {
        let filename = file.name
        zip.file(filename, file)
      }

      const date = new Date();
      const zipName = date.toLocaleDateString().replace(/\//g, '-');

      await zip.generateAsync({ type: 'blob' }).then((blobdata) => {
        fileToUpload = new File([blobdata], 'segue-' + zipName + '.zip');
        path = '/' + filename + '/' + fileToUpload.name;
      });
    }
    else {
      fileToUpload = this.files[0];
      path = '/' + filename + '/' + fileToUpload.name;
    }

    const task = this.afStorage.upload(path, fileToUpload);
    this.progress$ = task.percentageChanges();
    task.then(() => this.uploaded = true)
  }

  nextStep() {
    console.log(this.step);
    this.step++;
    switch (this.step) {
      case 1: this.buttonText = 'Ok, próximo'; break;
      case 2: this.buttonText = 'Próximo'; break;
      case 3: this.buttonText = 'Próximo'; break;
      case 4: this.buttonText = 'Criar link'; break;
    }

  }

  handleStep1(file: File): void {
    this.files.push(file);
    this.active = false;
  }

  handleStep2(password: { requirePassword: boolean, password: string }) {
    this.password = password.password;
    this.requirePassword = password.requirePassword;
  }

  handleStep3(allowAnonymous: { allowAnonymous: boolean }) {
    this.isAnonymous = allowAnonymous.allowAnonymous;
  }

  handleStep4(limit: { expirationDate: number, downloadLimit: number }) {
    this.expirationDate = limit.expirationDate;
    this.downloadLimit = limit.downloadLimit;

    this.generateLink();
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

    this.active = false;
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