import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { IFile } from 'src/app/interfaces/files';
import { FilessService } from 'src/app/services/files/files.service';
import CryptoJS from 'crypto-js';
import * as stepMessages from '../../../assets/texts/stepsMessages.json';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/users/users.service';
import { IUser, IUserAnonymous } from 'src/app/interfaces/users';
import { mergeMap } from 'rxjs/operators';
import { PlansService } from 'src/app/services/plans/plans.service';
import { IPlan } from 'src/app/interfaces/plan';
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { AnonymousUserService } from 'src/app/services/users/userAnonymous.service';
import firebase from 'firebase';
import { Step1Component } from 'src/app/components/steps/step1/step1.component';
import { FireService } from 'src/app/services/base/fire.service';

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
  errorMessage: string = '';

  password: string;
  requirePassword: boolean;
  isAnonymous: boolean;
  downloadLimit: number;
  expirationDate: number;

  user: IUser | IUserAnonymous;
  plan: IPlan;
  fingerprint: string;

  @ViewChild(Step1Component) step1: Step1Component;

  constructor(
    private fireService: FireService,
    private afStorage: AngularFireStorage,
    private filesService: FilessService,
    private config: NgbProgressbarConfig,
    private authService: AuthService,
    private userService: UserService,
    private anonymousUserService: AnonymousUserService,
    private planService: PlansService) {
  }

  ngOnInit(): void {
    this.stepMessages = stepMessages.messages;
    this.initProgressbarConfig();
    this.getUserInfo();
  }

  initProgressbarConfig(): void {
    this.config.max = 100;
    this.config.striped = true;
    this.config.animated = true;
    this.config.type = 'primary';
    this.config.height = '20px';
  }

  async getUserInfo(): Promise<void> {
    const user = this.authService.getCurrentUser;

    if (user === null) {
      this.fingerprint = await this.getBrowserFingerprint();
      this.findUserByFingerprint();
    }
    else if (user.isAnonymous)
      this.getAnonymousUserData(user);
    else if (!user.isAnonymous)
      this.getRegisteredUserData(user);
  }

  findUserByFingerprint(): void {
    const userRef = this.fireService.Firestore.collection('users').where('fingerprint', '==', this.fingerprint);
    userRef.get().subscribe(userSnap => {
      const user = userSnap.docs[0]?.data() as IUserAnonymous;
      if (user)
        this.user = user;
    });
  }

  async getBrowserFingerprint(): Promise<string> {
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
  }

  getAnonymousUserData(user: firebase.User): void {
    this.anonymousUserService.doc$(user.uid).pipe(
      mergeMap(user => {
        this.user = user;
        return this.planService.doc$(user.planId);
      })
    ).subscribe(plan => this.plan = plan);
  }

  getRegisteredUserData(user: firebase.User): void {
    this.userService.doc$(user.uid).pipe(
      mergeMap(user => {
        this.user = user;
        return this.planService.doc$(user.planId);
      })
    ).subscribe(plan => this.plan = plan);
  }

  async generateLink(): Promise<void> {
    const filename = await this.saveFilesData();
    await this.uploadFiles(filename);
    if (!this.user)
      this.registerAnonymousUser();
    else
      this.updateUserInfo();
  }

  updateUserInfo(): void {
    this.userService.update$({
      uploads: this.user.uploads + 1,
      storage: this.user.storage + this.files.reduce((acc, curr) => acc + curr.size, 0)
    }, this.user.uid);
  }

  async registerAnonymousUser(): Promise<void> {

    if (!this.fingerprint)
      this.fingerprint = await this.getBrowserFingerprint();

    const user = await this.authService.SignInAnonymous();
    const anonymousUser: IUserAnonymous = {
      fingerprint: this.fingerprint,
      isAnonymous: true,
      uid: user.user.uid,
      planId: 'ANONYMOUS',
      storage: this.files.reduce((acc, curr) => acc + curr.size, 0),
      uploads: 1
    }

    this.anonymousUserService.create$(anonymousUser, anonymousUser.uid);
  }

  async saveFilesData(): Promise<string> {
    const docId = this.filesService.createFirestoreId();
    this.id = docId;
    const files: IFile = {
      active: true,
      dateCreated: Date.now(),
      docId,
      downloadLimit: this.downloadLimit,
      expirationDate: this.expirationDate,
      requirePassword: this.requirePassword
    }

    if (this.requirePassword)
      files.password = CryptoJS.AES.encrypt(this.password, 'p31xE').toString();

    if (this.user)
      files.userId = this.user.uid;

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

  nextStep(): void {
    if (this.step === 3) {
      const input = document.createElement('input');
      input.setAttribute('value', window.location.href + 'download/' + this.id);
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    else {
      this.step++;
      switch (this.step) {
        case 1: this.buttonText = 'Ok, próximo'; break;
        case 2: this.buttonText = 'Criar link'; break;
        case 3: this.buttonText = 'Copiar link'; break;
      }
    }
  }

  handleStepsErros(error: string): void {
    this.errorMessage = error;
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

    this.step1.getLeftSize();
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