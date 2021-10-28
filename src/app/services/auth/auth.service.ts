import { Injectable, NgZone, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase';
import { IUser, IUserProvider } from 'src/app/interfaces/users';
import { HomeComponent } from 'src/app/views/home/home.component';
import { UserProviderService } from '../users/userProvider.service';
import { UserService } from '../users/users.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData: firebase.User;
  userPlan: string = 'FREE';

  constructor(
    private afAuth: AngularFireAuth,
    private route: Router,
    private userProviderService: UserProviderService
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

  SetUserPlan(newPlan: string) {
    this.userPlan = newPlan;
  }

  SignIn(email: string, senha: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, senha);
  }

  SignInAnonymous(): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInAnonymously()
  }

  SignUp(email: string, senha: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.createUserWithEmailAndPassword(email, senha);
  }

  ForgotPassword(form: { email: string }): Promise<void> {
    return this.afAuth.sendPasswordResetEmail(form.email);
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true : false
  }

  get getCurrentUser(): firebase.User {
    return JSON.parse(localStorage.getItem('user'));
  }

  GoogleAuth(): void {
    this.AuthLogin(new firebase.auth.GoogleAuthProvider());
  }

  AuthLogin(provider: firebase.auth.AuthProvider) {
    this.afAuth.signInWithPopup(provider).then((credential) => {
      const userProvider: IUserProvider = {
        dateCreated: Date.now(),
        email: credential.user.email,
        isAnonymous: false,
        name: credential.user.displayName,
        provider: provider.providerId,
        uid: credential.user.uid,
        photoUrl: credential.user.photoURL,
        planId: 'FREE',
        storage: 0,
        uploads: 0
      }

      this.userProviderService.create$(userProvider, userProvider.uid);

      this.route.navigate(['/']);
    })
  }

  async SignOut(): Promise<void> {
    await this.afAuth.signOut();
    localStorage.removeItem('user');
  }
}