import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-sign-in-form',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInFormComponent implements OnInit {

  email = new FormControl('');
  password = new FormControl('');

  loginError: string;

  constructor(private authService: AuthService,
    private route: Router) { }

  ngOnInit(): void { }

  loginWithGoogle() {
    this.authService.GoogleAuth();
  }

  login(): void {
    const email = this.email.value;
    const password = this.password.value;

    this.authService.SignIn(email, password).then(result => {
      if (result.user.emailVerified)
        this.route.navigate(['/']);
      else
        this.loginError = "E-mail não verificado!"
    }).catch(error => {
      if (error.code == 'auth/wrong-password') {
        this.loginError = "Senha inválida!";
      }
      if (error.code == 'auth/user-not-found') {
        this.loginError = "Usuário não encontrado!";
      }
    })
  }
}
