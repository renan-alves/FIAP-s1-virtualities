import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IUsers } from 'src/app/interfaces/users';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserssService } from 'src/app/services/users/users.service';
import CryptoJS from 'crypto-js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpFormComponent implements OnInit {

  registerError: string;
  submited: boolean;
  isGoogle: boolean;

  registerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    birthday: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  })

  constructor(private authService: AuthService,
    private usersService: UserssService,
    private modalService: NgbModal,
    private route: Router) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      const user = this.authService.getCurrentUser;
      this.usersService.exists$(user.uid).subscribe(exists => {
        if (!exists) {
          this.isGoogle = user.providerData[0].providerId === 'google.com';
          this.registerForm.controls.email.disable();
          this.registerForm.setValue({
            name: user.displayName,
            email: user.email,
            country: '',
            state: '',
            birthday: '',
            password: ''
          });
        }
      });
    }
  }

  async register(content: TemplateRef<unknown>): Promise<void> {
    this.submited = true;

    const email = this.registerForm.get('email').value;
    const password = this.registerForm.get('password').value;

    const passwordHash = CryptoJS.AES.encrypt(password, 'p31xE').toString();
    const [dia, mes, ano] = this.registerForm.get('birthday').value.split("/");
    const birthday = new Date(ano, mes - 1, dia).getTime();

    let user: IUsers = {
      ...this.registerForm.value,
      password: passwordHash,
      email,
      birthday
    }

    if (this.isGoogle)
      user.uid = this.authService.getCurrentUser.uid;
    else
      await this.authService.SignUp(email, password).then(result => {
        result.user.sendEmailVerification();

        user.uid = result.user.uid;

        this.modalService.open(content);
      }).catch(error => {
        if (error.code == 'auth/email-already-in-use')
          this.registerError = 'E-mail já cadastrado!';

      });

    console.log(user);

    this.route.navigate(['/compartilhamentos']);

    this.usersService.create$(user, user.uid).subscribe();
  }

  goToLogin(): void {
    this.modalService.dismissAll();
    this.route.navigate(['/login']);
  }
}
