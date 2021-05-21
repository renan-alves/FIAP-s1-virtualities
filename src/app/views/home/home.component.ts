import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { IUsers } from 'src/app/interfaces/users';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  users: IUsers[];
  filePath: File;
  progress$: Observable<number>;

  constructor(
    private afStorage: AngularFireStorage
  ) { }

  ngOnInit(): void { }

  upload(event: { target: { files: File[]; }; }): void {
    this.filePath = event.target.files[0];
  }

  uploadImage(): void {
    const task = this.afStorage.upload('/' + this.filePath.name, this.filePath);
    this.progress$ = task.percentageChanges();
  }
}
