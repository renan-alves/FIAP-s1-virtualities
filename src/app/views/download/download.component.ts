import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IFile } from 'src/app/interfaces/files';
import { FilessService } from 'src/app/services/files/files.service';
import CryptoJS from 'crypto-js';
import JSZip from 'jszip';
import { ListResult, Reference } from '@angular/fire/storage/interfaces';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {

  file: IFile;
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

  downloadSingleFile(item: Reference): void {
    const url = item.getDownloadURL();
    const metadata = item.getMetadata();

    Promise.all([url, metadata]).then(async ([url, metadata]) => {
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
    })
  }

  async downloadMultipleFiles(items: ListResult): Promise<void> {
    const zip = new JSZip();

    const promises = items.items.map(item => Promise.all([
      item.getDownloadURL(),
      item.getMetadata()
    ]));

    const datas = [];

    for (const promise of promises) {
      await promise.then(data => datas.push(data));
    }

    for (const [url, metadata] of datas) {
      const response = await fetch(url);
      const data = await response.blob();
      const mime = {
        type: metadata.contentType
      };
      zip.file(metadata.name, new File([data], metadata.name, mime));
    }

    const date = new Date();
    const zipName = 'segue-' + date.toLocaleDateString().replace(/\//g, '-') + '.zip';

    await zip.generateAsync({ type: 'blob' }).then((blobdata) => {
      const a: HTMLAnchorElement = document.createElement('a');
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(new File([blobdata], zipName));
      a.href = url;
      a.download = zipName;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  download(file: IFile): void {
    this.invalidPassword = false;

    if (!this.checkAvailability(file)) return;

    if (file.requirePassword)
      if (!this.checkPassword()) return;

    this.afStorage.ref('/' + file.docId).listAll().subscribe(async items => {

      if (items.items.length === 1)
        this.downloadSingleFile(items.items[0])
      else
        this.downloadMultipleFiles(items)

      this.file.downloadCount = this.file.downloadCount ? this.file.downloadCount + 1 : 1;
      this.filesService.update$(this.file, this.file.docId);

      this.downloaded = true;
      this.file = null;
    })
  }

  checkAvailability(file: IFile): boolean {
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
