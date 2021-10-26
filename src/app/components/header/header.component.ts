import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FireService } from 'src/app/services/base/fire.service';
import firebase from 'firebase';
import { EMPTY, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { IUser } from 'src/app/interfaces/users';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  faUser = faUser;
  expanded: boolean;
  isLoggedIn: boolean;
  showMenu: boolean;
  showMyLinks: boolean;
  user: firebase.User;

  constructor(private afAuth: AngularFireAuth,
    private fireService: FireService,
    private authService: AuthService,
    private route: Router) {

  }

  ngOnInit(): void {
    this.afAuth.authState.pipe(
      tap((user) => {
        this.user = user;
        if (user && !user.isAnonymous && user.emailVerified)
          this.isLoggedIn = true;
        else this.isLoggedIn = false;
      }),
      mergeMap((user) => {
        if (user) return of(user)
        this.showMenu = true;
        return EMPTY
      }),
      mergeMap((user) => this.fireService.Firestore.collection("users").doc(user.uid).get())
    ).subscribe(userDoc => {
      const user = userDoc.data() as IUser;

      if (user.planId === "PRO")
        this.showMyLinks = true;

      this.showMenu = true;
    })
  }

  toggleHamburger() {
    this.expanded = !this.expanded;
  }

  async deslogar() {
    await this.authService.SignOut();
    this.goHome();
  }

  async excluirConta() {
    const userRef = this.fireService.Firestore.collection("users").doc(this.authService.getCurrentUser.uid);

    const fileRef = this.fireService.Firestore.collection("files").where("userId", "==", this.authService.getCurrentUser.uid);

    fileRef.get().subscribe(fileSnap => {
      fileSnap.docs.forEach(doc => {
        doc.ref.delete().subscribe();
      })

    });
    await this.authService.SignOut();
    userRef.delete().subscribe();
    await this.user.delete();
    this.goHome();
  }

  goHome(): void {
    this.route.navigate(["/"]);
  }
}
