import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { IUsers } from 'src/app/interfaces/users';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserssService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-temp',
  templateUrl: './temp.component.html',
  styleUrls: ['./temp.component.scss'],
})
export class TempComponent implements OnInit, AfterViewInit {
  @ViewChild('modalButtom') modalButtom: ElementRef;

  currentUser: IUsers;
  filePath: File;
  progress$: Observable<number>;
  modalStep = 'login';

  modalForm: FormGroup;

  constructor(
    private afStorage: AngularFireStorage,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private usersService: UserssService
  ) { }

  ngAfterViewInit(): void {
    this.modalButtom.nativeElement.click();
  }

  ngOnInit(): void {
    this.modalForm = this.formBuilder.group({
      nome: [''],
      email: [''],
      senha: ['']
    });

    this.currentUser = this.authService.getCurrentUser;
  }

  getFile(event: { target: { files: File[]; }; }): void {
    this.filePath = event.target.files[0];
  }

  upload(): void {
    const task = this.afStorage.upload('/' + this.filePath.name, this.filePath);
    this.progress$ = task.percentageChanges();
  }

  download(): void {
    const ref = this.afStorage.ref('/ezgif.com-gif-maker.mp4');
    ref.getDownloadURL().subscribe(url => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function (event) {
        var blob = xhr.response;
      };
      xhr.open('GET', url);
      xhr.send();
    })
  }

  openModal(content) {
    if (!this.authService.isLoggedIn)
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' })
  }

  goToModalStep(step: string) {
    this.modalStep = step;
  }

  doSignin() {
    this.authService.SignIn(this.modalForm.value).then((result) => {
      this.usersService.doc$(result.user.uid).subscribe(user => {
        this.currentUser = user;
      })
      this.modalService.dismissAll();
    }).catch((error) => {
      window.alert(error.message)
    })
  }

  doSignup() {
    this.authService.SignUp(this.modalForm.value).then((result) => {
      this.currentUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: this.modalForm.value['nome']
      };
      this.authService.SetUserData(this.currentUser);
      this.modalService.dismissAll();
    }).catch((error) => {
      window.alert(error.message)
    })
  }

  doForgotPassword() {
    this.authService.ForgotPassword(this.modalForm.value).then(() => {
      window.alert('Um email foi enviado.');
    }).catch((error) => {
      window.alert(error)
    })
  }
}
