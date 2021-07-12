import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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

  registerForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    country: new FormControl(''),
    state: new FormControl(''),
    birthday: new FormControl(''),
    password: new FormControl('')
  })

  constructor(private authService: AuthService,
    private usersService: UserssService,
    private modalService: NgbModal,
    private route: Router) { }

  ngOnInit(): void { }

  register(content: TemplateRef<unknown>): void {
    const email = this.registerForm.get('email').value;
    const password = this.registerForm.get('password').value;

    this.authService.SignUp(email, password).then(result => {
      result.user.sendEmailVerification();

      const passwordHash = CryptoJS.AES.encrypt(password, 'p31xE').toString();
      const [dia, mes, ano] = this.registerForm.get('birthday').value.split("/");
      const birthday = new Date(ano, mes - 1, dia).getTime();

      const user: IUsers = {
        ...this.registerForm.value,
        uid: result.user.uid,
        password: passwordHash,
        birthday
      };

      this.usersService.create$(user).subscribe();

      this.modalService.open(content);
    }).catch(error => {

      if (error.code == 'auth/email-already-in-use')
        this.registerError = 'E-mail já cadastrado!';
    });
  }

  goToLogin(): void {
    this.modalService.dismissAll();
    this.route.navigate(['/login']);
  }
}
