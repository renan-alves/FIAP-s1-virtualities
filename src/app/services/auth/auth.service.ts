import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase';
import { IUsers } from 'src/app/interfaces/users';
import { UserssService } from '../users/users.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData: firebase.User;

  constructor(
    private afAuth: AngularFireAuth,
    private usersService: UserssService,
    private route: Router
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
  }

  SignIn(email: string, senha: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, senha);
  }

  SignUp(email: string, senha: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.createUserWithEmailAndPassword(email, senha);
  }

  ForgotPassword(form: { email: string }): Promise<void> {
    return this.afAuth.sendPasswordResetEmail(form.email);
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null) ? true : false; // && user.emailVerified !== false
  }

  get getCurrentUser(): firebase.User {
    return JSON.parse(localStorage.getItem('user'));
  }

  GoogleAuth() {
    this.AuthLogin(new firebase.auth.GoogleAuthProvider());
  }

  AuthLogin(provider: firebase.auth.AuthProvider) {
    this.afAuth.signInWithPopup(provider).then(result => {
      this.usersService.exists$(result.user.uid).subscribe(user => {
        console.log(user);
        if (user)
          this.route.navigate(['/']);
        else
          this.route.navigate(['/register']);
      })
    })
  }

  SignOut(): Promise<void> {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
    })
  }
}