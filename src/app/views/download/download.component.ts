import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IFiles } from 'src/app/interfaces/files';
import { FilessService } from 'src/app/services/files/files.service';
import CryptoJS from 'crypto-js';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {

  file: IFiles;
  unavailableReason: string;
  downloaded: boolean;

  invalidPassword: boolean;
  password = new FormControl('');

  constructor(private route: ActivatedRoute,
    private afStorage: AngularFireStorage,
    private filesService: FilessService) { }

  ngOnInit(): void {
    this.filesService.doc$(this.route.snapshot.paramMap.get('fileId')).subscribe(file => {
      if (this.checkAvailability(file))
        this.file = file

    }, (_error) => this.unavailableReason = 'Arquivo não existe')
  }

  download(file: IFiles): void {
    this.invalidPassword = false;

    if (!this.checkAvailability(file)) return;

    if (file.requirePassword)
      if (!this.checkPassword()) return;


    this.afStorage.ref('/' + file.docId).listAll().subscribe(items => {
      if (items.items.length > 0) {

        const url = items.items[0].getDownloadURL();
        const metadata = items.items[0].getMetadata();

        Promise.all([url, metadata]).then(async ([url, metadata]) => {

          console.log(metadata);

          const xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          xhr.onload = (_event) => {
            const blob = new Blob([xhr.response], { type: metadata.contentType });
            const a: HTMLAnchorElement = document.createElement('a');
            document.body.appendChild(a);
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = metadata.name;
            a.click();
            window.URL.revokeObjectURL(url);
          };
          xhr.open('GET', url);
          xhr.send();

          this.file.downloadCount = this.file.downloadCount ? this.file.downloadCount + 1 : 1;
          this.filesService.update$(this.file, this.file.docId);

          this.downloaded = true;
          this.file = null;
        }).catch(error => {
          switch (error.code) {
            case 'storage/object-not-found':
              console.error("File doesn't exist");
              break;
            case 'storage/unauthorized':
              console.error("User doesn't have permission to access the object")
              break;
            case 'storage/canceled':
              console.error("User canceled the upload")
              break;
            case 'storage/unknown':
              console.error("Unknown error occurred, inspect the server response")
              break;
          }
        })
      }
      else console.error('Documento não existe');
    })
  }

  checkAvailability(file: IFiles): boolean {
    const currentDate = Date.now();

    if (!file.active)
      this.unavailableReason = 'Este arquivo não está mais disponível';
    else if (file.downloadCount >= file.downloadLimit)
      this.unavailableReason = 'Este link excedeu o limite de downloads';
    else if (currentDate > file.expirationDate) {
      this.unavailableReason = 'Este link expirou';
    }

    return this.unavailableReason ? false : true;
  }

  checkPassword(): boolean {
    const bytes = CryptoJS.AES.decrypt(this.file.password, 'p31xE');
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    if (originalText === this.password.value)
      return true;

    this.invalidPassword = true;
    return false;
  }
}
