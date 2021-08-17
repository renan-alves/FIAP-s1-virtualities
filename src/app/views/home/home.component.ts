import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import JSZip from 'jszip';
import { Observable } from 'rxjs';
import { IFiles } from 'src/app/interfaces/files';
import { FilessService } from 'src/app/services/files/files.service';
import CryptoJS from 'crypto-js';
import * as stepMessages from '../../../assets/texts/stepsMessages.json';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';

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
  progress: { file: File, progress: Observable<number> }[] = [];
  uploadStatus: boolean[] = [];
  uploaded: boolean;
  id: string;

  password: string;
  requirePassword: boolean;
  isAnonymous: boolean;
  downloadLimit: number;
  expirationDate: number;

  totalTransferred: number;

  constructor(
    private afStorage: AngularFireStorage,
    private filesService: FilessService,
    private config: NgbProgressbarConfig) {
  }

  ngOnInit(): void {
    console.log('home ')
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
    this.id = docId;
    const files: IFiles = {
      active: true,
      dateCreated: Date.now(),
      docId,
      downloadLimit: this.downloadLimit,
      expirationDate: this.expirationDate,
      requirePassword: this.requirePassword
    }

    if (this.requirePassword)
      files.password = CryptoJS.AES.encrypt(this.password, 'p31xE').toString();

    this.filesService.create$(files, docId);

    return docId;
  }

  async uploadFiles(filename: string): Promise<void> {
    for (const file of this.files) {
      const path = '/' + filename + '/' + file.name;

      const task = this.afStorage.upload(path, file);
      task.snapshotChanges().subscribe(snap => {
        if (snap.state === 'success')
          this.uploadStatus.push(true);

        if (this.files.length === this.uploadStatus.length)
          this.uploaded = true;
      });
      
      this.progress.push({ file, progress: task.percentageChanges() });
    }
  }

  nextStep() {
    console.log(this.step);
    this.step++;
    switch (this.step) {
      case 1: this.buttonText = 'Ok, próximo'; break;
      case 2: this.buttonText = 'Criar link'; break;
      case 3: this.buttonText = 'Copiar link'; break;
    }
  }

  handleStep1(file: File): void {
    this.files.push(file);
    this.active = false;
  }

  handleStep2(security: { requirePassword: boolean, password: string, expirationDate: number, downloadLimit: number }) {
    this.password = security.password;
    this.requirePassword = security.requirePassword;
    this.expirationDate = security.expirationDate;
    this.downloadLimit = security.downloadLimit;

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