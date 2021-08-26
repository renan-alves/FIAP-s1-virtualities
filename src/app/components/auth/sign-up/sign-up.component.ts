import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IUser } from 'src/app/interfaces/users';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/users/users.service';
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
    password: new FormControl('', Validators.required)
  })

  constructor(private authService: AuthService,
    private usersService: UserService,
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

    let user: Partial<IUser> = {
      email,
      name: this.registerForm.get('name').value,
      password: passwordHash,
      isAnonymous: false,
      planId: 'FREE',
      storage: 0,
      uploads: 0
    }

    await this.authService.SignUp(email, password).then(result => {
      result.user.sendEmailVerification();

      user.uid = result.user.uid;

      this.route.navigate(['/login']);
      this.modalService.open(content);
    }).catch(error => {
      if (error.code == 'auth/email-already-in-use')
        this.registerError = 'E-mail já cadastrado!';
    });


    this.usersService.create$(user as IUser, user.uid).subscribe();
  }

  goToLogin(): void {
    this.modalService.dismissAll();
  }
}
