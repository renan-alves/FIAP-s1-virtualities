import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private afStorage: AngularFireStorage) { }

  ngOnInit(): void {
  }

  testDownload() {
    this.afStorage.ref('/' + this.route.snapshot.paramMap.get('fileId')).listAll().subscribe(items => {
      if (items.items.length > 0)
        items.items[0].getDownloadURL().then(async url => {
          const e = document.createElement('a');
          e.href = url;
          e.download = url.substr(url.lastIndexOf('/') + 1);
          document.body.appendChild(e);
          e.click();
          document.body.removeChild(e);
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
      else console.error('Documento não existe');
    })
  }
}
