import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import firebase from 'firebase';
import { IUsers } from 'src/app/interfaces/users';
import { UserssService } from '../users/users.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData: firebase.User;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,  
    private ngZone: NgZone,
    private usersService: UserssService
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

  SignIn(form: {email: string, senha: string}) {
    return this.afAuth.signInWithEmailAndPassword(form.email, form.senha);
  }

  SignUp(form: {email: string, senha: string}) {
    return this.afAuth.createUserWithEmailAndPassword(form.email, form.senha);
  }

  ForgotPassword(form: {email: string}) {
    return this.afAuth.sendPasswordResetEmail(form.email);
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null) ? true : false; // && user.emailVerified !== false
  }

  get getCurrentUser(): IUsers {
    return JSON.parse(localStorage.getItem('user'));
  }

  // GoogleAuth() {
  //   return this.AuthLogin(new auth.GoogleAuthProvider());
  // }

  // AuthLogin(provider) {
  //   return this.afAuth.signInWithPopup(provider)
  //   .then((result) => {
  //      this.ngZone.run(() => {
  //         this.router.navigate(['dashboard']);
  //       })
  //     this.SetUserData(result.user);
  //   }).catch((error) => {
  //     window.alert(error)
  //   })
  // }

  SetUserData(user: IUsers) {
    this.usersService.create$(user, user.uid);
  }

  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
    })
  }
}